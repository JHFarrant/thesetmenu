import { useCallback, useMemo, useState, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  Node,
  Edge,
} from "reactflow";
import humanizeDuration from "humanize-duration";
import dagre from "dagre";
import { DateTime, Duration, Interval } from "luxon";
import { Event } from "../types";
import "reactflow/dist/style.css";
import EventNode from "./nodeType";
import SimpleEdge from "./SimpleEdge";

import { getImage } from "../components/itinerary";
import { useScreen } from "usehooks-ts";

const snapGrid: [number, number] = [20, 20];
const defaultViewport = { x: 0, y: 0, zoom: 0.1 };

const initialNodes = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
  { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
];

const nodeWidth = 350;
const nodeHeight = 150;

const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

function Flow({ dayItinerary, favouriteArtists }: any) {
  const nodeTypes = useMemo(
    () => ({
      eventNode: EventNode,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      simpleEdge: SimpleEdge,
    }),
    []
  );

  // console.log("dayItinerary")
  // console.log(dayItinerary)
  // console.log("favouriteArtists")
  // console.log(favouriteArtists)

  const dayNodes = dayItinerary.map((event: Event, id: number) => {
    const favourite = favouriteArtists[event.name];
    return {
      id: event.short.replace(")", "_").replace("(", "_"),
      position: { x: 0, y: 0 },
      type: "eventNode",
      data: { event, favourite, nodeHeight, nodeWidth },
    };
  });
  //   const dayNodes = [ { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  //   { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
  // ]

  console.log("getEdges");
  const dayEdges = getEdges(dayNodes);

  console.log("dayNodes:", dayNodes);
  console.log("dayEdges:", dayEdges);

  //   const  = dayItinerary.reduce((blocks: any, event: Event, id: number) => {
  //     // const prevEvent = event
  //     // const nextEvent = dayItinerary[id+1]
  //     const currentBlockID = Math.max(...Object.keys(blocks).map((n) => Number(n)))
  //     let edges = []
  //     console.log(`Checking ${id} ${event.name} ${event.start} ${event.end}`)

  //     if(id === (dayItinerary.length -1)) {
  //         console.log(`---> Last skipping`)
  //         return blocks

  //     }
  //     if(overlap(event, dayItinerary[id+1]) != "CLASH"){
  //         console.log(`--->  Does not clash with next ${dayItinerary[id+1].name} ${dayItinerary[id+1].start} ${dayItinerary[id+1].end}`)
  //         blocks[currentBlockID + 1] = {edges: [{ id: `e${id}-${id+1}`, source: id.toString(), target: (id+1).toString(), type: 'smoothstep', animated: true, label: getLabel(event, dayItinerary[id+1])}]
  //     }else{
  //         console.log(`--->  Clash detected with next ${dayItinerary[prevId+1].name} ${dayItinerary[prevId+1].start} ${dayItinerary[prevId+1].end}`)
  //         console.log(dayItinerary.slice(prevId + 1))
  //         edges = dayItinerary.slice(prevId + 1).reduce((edges: any, nextEvent: Event, i: number)=> {
  //             const nextId = i + prevId + 1
  //             if(overlap(prevEvent, nextEvent) == "CLASH"){
  //                 console.log(`--->  --->  Clash detected with next ${nextEvent.name} ${nextEvent.start} ${nextEvent.end}`)
  //                 edges.push({ id: `e${prevId}-${nextId}`, source: prevId.toString(), target: (nextId).toString(), type: 'smoothstep', animated: true, label: getLabel(prevEvent, nextEvent)})
  //             }
  //             return edges
  //         },[])
  //     }

  //  const dayEdges = []
  //     return blocks
  //   }, {})

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: "TB" });

  dayNodes.forEach((node: any) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  dayEdges.forEach((edge: any) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  dayNodes.forEach((node: any, i: number) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = "top";
    node.sourcePosition = "bottom";

    const previousNode = dayNodes[i - 1];
    const overlapping = previousNode
      ? isOverlap(node.data.event, previousNode.data.event, false)
      : false;
    overlapping &&
      console.log(
        (node.data.event.start - previousNode.data.event.start) /
          (previousNode.data.event.end - previousNode.data.event.start)
      );
    const adjustment = overlapping
      ? (nodeHeight * (node.data.event.start - previousNode.data.event.start)) /
        (previousNode.data.event.end - previousNode.data.event.start)
      : 0;
    console.log(adjustment);
    const y = false
      ? previousNode.position.y + adjustment
      : nodeWithPosition.y * 1.5 - nodeHeight / 2;
    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y,
    };

    // if(!(dayEdges.find(e => e.target == node.id))){node.data.topHandle = false}
    // if(!(dayEdges.find(e => e.source == node.id))){node.data.topHandle = false}
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(dayNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(dayEdges);
  const [height, setHeight] = useState<any>(0);

  console.log(nodes);
  console.log(dayEdges);
  const onConnect = useCallback(
    (params: any) =>
      setEdges((eds) =>
        addEdge({ ...params, animated: true, style: { stroke: "#fff" } }, eds)
      ),
    []
  );

  useEffect(() => {
    if (nodes.length && edges.length) {
      return;
    }
    setNodes(dayNodes);
    setEdges(dayEdges);
  }, [dayNodes, dayEdges]);

  useEffect(() => {
    if (height == 0) {
      // setHeight(Math.max(...edges.map(e => e.data.level),1) * nodeHeight * 1.5)
      setHeight("300px");
    }
  }, []);

  console.log("height");
  console.log(height);

  return (
    <div style={{ height, minWidth: "fit-content" }}>
      {!!height && (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onConnect={onConnect}
          fitView={true}
          nodesDraggable={false}
          panOnDrag={false}
          preventScrolling={false}
          zoomOnPinch={false}
          zoomOnScroll={false}
          proOptions={{ hideAttribution: true }}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          snapToGrid={true}
          minZoom={0.1}
          snapGrid={snapGrid}
          connectionLineType={ConnectionLineType.SmoothStep}
          defaultViewport={defaultViewport}
        >
          {/* <MiniMap />
      <Controls /> */}
          {/* <Background /> */}
        </ReactFlow>
      )}
    </div>
  );
}

export default Flow;

/////////////

const overlap = (prevEvent: Event, nextEvent: Event) => {
  const interval = Interval.fromDateTimes(prevEvent.end, nextEvent.start);

  if (!interval.isValid) {
    if (
      interval.toDuration().toMillis() <
      Duration.fromObject({ minutes: 10 }).toMillis()
    ) {
      return "OVERLAP";
    } else {
      return "CLASH";
    }
  } else {
    if (
      interval.toDuration().toMillis() <
      Duration.fromObject({ minutes: 10 }).toMillis()
    ) {
      return "QUICK";
    }
    if (
      interval.toDuration().toMillis() >
      Duration.fromObject({ hours: 1 }).toMillis()
    ) {
      return "SLOW";
    }
  }
  return "PERFECT";
};

const getLabel = (prevEvent: Event, nextEvent: Event) => {
  const interval = Interval.fromDateTimes(
    prevEvent.end,
    nextEvent.start
  ).toDuration(["hours", "minutes"]);
  if (interval < Duration.fromObject({ minutes: 10 })) {
    return { text: `${humanizeDuration(interval.toMillis())}, RUN 🏃‍♀️🏃‍♂️`, color: "red" };
  }
  if (interval < Duration.fromObject({ minutes: 20 })) {
    return {
      text: `${humanizeDuration(interval.toMillis())}, Quick Walk`,
      color: "orange",
    };
  }
  return { text: humanizeDuration(interval.toMillis()), color: "green" };
};

const isOverlap = (
  eventA: Event,
  eventB: Event,
  inclusive: boolean = true
): boolean => {
  return inclusive
    ? eventA.start <= eventB.end && eventA.end >= eventB.start
    : eventA.start < eventB.end && eventA.end > eventB.start;
};

function getEdges(nodes: Node[]): Edge[] {
  if (!nodes.length) {
    return [];
  }
  // console.log(`nodes ${nodes}`)

  const edges: { [key: string]: Edge } = {};

  function addUniqueEdge(
    source: string,
    target: string,
    label: any,
    level: number
  ): void {
    const edgeId = `e${source}-${target}`;

    if (!(edgeId in edges)) {
      const edge = {
        id: edgeId,
        source,
        target,
        data: { label, level },
        style: {
          strokeWidth: 2,
          stroke: "#FFFFF",
        },
        type: "simpleEdge",
        animated: true,
      };
      edges[edge.id] = edge;
    }
  }

  function goToNextEvent(
    currentNode: Node,
    nodes: Node[],
    level: number = 0
  ): void {
    // Rules
    // -----
    // Cannot skip event unless it overlaps with another event

    // Try going though all possible combinations

    // Check if next event is possible. If yes then create edge go to just that node.

    // If next event has clashes then create a decision node. Fast forward to next clash free event.

    // Simple: Make an option between all 3

    // Attempt to get a clash free itinerary by removing a single event from the decision, try 2, then 3 etc. Record the effective strategies

    // Got to every event I can go to (but not if I can go to a full event before hand)

    console.log(
      `goToNextEvent ${
        currentNode.data.event.short
      } ${currentNode.data.event.start.toFormat(
        "h:mma"
      )} ${currentNode.data.event.end.toFormat("h:mma")}`
    );
    const upcomingEvents = nodes.filter(
      (n) => n.data.event.start >= currentNode.data.event.end
    );
    console.log(` ---> upcomingEvents`);
    console.log(upcomingEvents);
    if (!upcomingEvents.length) {
      return;
    }
    upcomingEvents.forEach((n) =>
      console.log(n.data.event.start.toFormat("h:mma"))
    );
    const upcomingEventsSoonestFinishing = Math.min(
      ...upcomingEvents.map((n) => n.data.event.end)
    );
    console.log(` ---> upcomingEventsSoonestFinishing`);
    console.log(upcomingEventsSoonestFinishing);
    const visitableEvents = upcomingEvents.filter(
      (n) => n.data.event.start < upcomingEventsSoonestFinishing
    );
    console.log(` ---> visitableEvents`);
    console.log(visitableEvents);

    visitableEvents.forEach((n) =>
      addUniqueEdge(
        currentNode.id,
        n.id,
        getLabel(currentNode.data.event, n.data.event),
        level
      )
    );

    visitableEvents.forEach((n) => goToNextEvent(n, nodes, level + 1));
  }

  goToNextEvent(nodes[0], nodes);

  //   if (path.length > 1) {
  //     const source = path[path.length - 2];
  //     const target = path[path.length - 1];
  //     addUniqueEdge(source, target, '15 minutes');
  //   }

  //   if (index === events.length) {
  //     return;
  //   }

  //   const currentEvent = events[index];

  //   for (let i = index + 1; i < events.length; i++) {
  //     const nextEvent = events[i];

  //     if (!isOverlap(currentEvent, nextEvent)) {
  //       const nextEventId = nodeId.toString();

  //       // Skip creating edges if the nextEventId is the same as the current node
  //       if (nextEventId !== path[path.length - 1]) {
  //         addUniqueEdge(path[path.length - 1], nextEventId, '15 minutes');
  //         path.push(nextEventId);
  //         backtrack(i + 1, path);
  //         path.pop();
  //       }
  //     }
  //   }
  // }

  // for (let i = 0; i < events.length; i++) {
  //   const eventId = nodeId.toString();
  //   const event = events[i];
  //   const node: Node = {
  //     id: nodeId.toString(),
  //     position: { x: 0, y: 0 },
  //     type: 'eventNode',
  //     data: {
  //       event,
  //       favourite: favouriteArtists[event.name],
  //       nodeHeight,
  //       nodeWidth,
  //     },
  //   };
  //   nodes.push(node);
  //   nodeId++;
  //   backtrack(i + 1, [eventId]);
  // }
  const edgesArray = Object.values(edges);
  edgesArray.forEach((edge) => {
    const otherSameLevelEdges = edgesArray.filter(
      (e: Edge) =>
        e.id == edge.id ||
        (e.data.level == edge.data.level &&
          e.source != edge.source &&
          e.target != edge.target)
    );

    if (otherSameLevelEdges.length <= 1) {
      edge.data.offset = 0;
      return;
    }
    console.log(edge.id);
    console.log(edge.data.level);
    console.log("otherSameLevelEdges");
    console.log(otherSameLevelEdges);
    const position = otherSameLevelEdges.findIndex(
      (e: Edge) => e.id === edge.id
    );
    console.log("position");
    console.log(position);

    edge.data.offset = position;
  });
  return Object.values(edges);
}
