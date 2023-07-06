import json
import requests

# Function to fetch artist ID from Spotify API
def get_artist_id(artist_id):
    url = f'https://api.spotify.com/v1/artists/{artist_id}'
    headers = {
        'Authorization': 'Bearer <<TOKEN>>'
    }
    response = requests.get(url, headers=headers)
    data = response.json()

    # Extract the artist ID from the API response
    if 'id' in data:
        return data['id']
    return None

# Function to load artist data from JSON file
def load_artist_data(file_path):
    with open(file_path, 'r') as file:
        return json.load(file)

# Function to save artist data to JSON file
def save_artist_data(data, file_path):
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=4)

# Path to the JSON file containing artist data
json_file_path = '../public/g2023SpotifyIDs.json'

# Load artist data from JSON file
artist_data = load_artist_data(json_file_path)

# Iterate over each artist in the data
new_artist_data = {}
for artist_id, artist_name in artist_data.items():
    # If artist ID is missing or different, fetch the ID from Spotify API
    new_artist_id = get_artist_id(artist_id)
    new_artist_data[artist_id] = artist_name
    if new_artist_id != artist_id:
        new_artist_data[new_artist_id] = artist_name
        print(f"Updated artist ID for '{artist_name}': {new_artist_id}")

# Save updated artist data to JSON file
save_artist_data(new_artist_data, json_file_path)
print("Artist data updated and saved.")
