import os
import requests
from serpapi import GoogleSearch

# Proxy settings
proxies = {
    "http": "http://14a2a8e06348d:1842948cf0@161.77.82.100:12323",
    "https": "http://14a2a8e06348d:1842948cf0@161.77.82.100:12323",
}

def download_images(query, api_key, limit=10):
    search = GoogleSearch({
        "q": query,
        "tbm": "isch",
        "ijn": "0",
        "api_key": api_key,
        "tbs": "sur:fmc",  # Filter for free-to-use images
    })

    results = search.get_dict()
    images_results = results.get('images_results', [])
    
    if not images_results:
        print("No images found.")
        return

    os.makedirs('downloads', exist_ok=True)

    for index, image in enumerate(images_results[:limit]):
        image_url = image.get('original')
        print(f"Attempting to download image {index + 1}: {image_url}")
        try:
            response = requests.get(image_url, proxies=proxies, timeout=10)
            response.raise_for_status()  # Check if the request was successful
            file_path = os.path.join('downloads', f'image_{index + 1}.jpg')
            with open(file_path, 'wb') as handler:
                handler.write(response.content)
            print(f"Downloaded {file_path}")
        except Exception as e:
            print(f"Could not download image {index + 1}: {e}")

if __name__ == "__main__":
    query = "Yolo architecture"
    api_key = "9831577a28a9862f0354d3370cf062a2193d604edeb3b536cfce19d36b3070a3"
    download_images(query, api_key, limit=10)
