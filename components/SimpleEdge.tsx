import React, { FC } from "react";
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from "reactflow";

const SimpleEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}) => {
  const [edgePath, labelX, labelY, offsetX, offsetY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  console.log({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
  });
  console.log({ edgePath, labelX, labelY, offsetX, offsetY });
  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          strokeWidth: 3,
          stroke: "#FFFFF",
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${
              sourceX + (labelX - sourceX) * 0.7
            }px,${sourceY + (labelY - sourceY) * 0.7}px)`,
            background: "#E5E7EB",
            padding: 10,
            borderRadius: 5,
            fontSize: 12,
            fontWeight: 700,
            color: data.label.color,
          }}
          className="nodrag nopan"
        >
          {data.label.text}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default SimpleEdge;
