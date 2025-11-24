# Recraft

> Converts a given raster image to SVG format using Recraft model.


## Overview

- **Endpoint**: `https://fal.run/fal-ai/recraft/vectorize`
- **Model ID**: `fal-ai/recraft/vectorize`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: stylized, transform



## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`image_url`** (`string`, _required_):
  The URL of the image to be vectorized. Must be in PNG, JPG or WEBP format, less than 5 MB in size, have resolution less than 16 MP and max dimension less than 4096 pixels, min dimension more than 256 pixels.
  - Examples: "https://storage.googleapis.com/falserverless/example_inputs/man_wave.png"



**Required Parameters Example**:

```json
{
  "image_url": "https://storage.googleapis.com/falserverless/example_inputs/man_wave.png"
}
```


### Output Schema

The API returns the following output format:

- **`image`** (`File`, _required_):
  The vectorized image.
  - Examples: {"file_size":85336,"file_name":"image.svg","content_type":"image/svg+xml","url":"https://v3.fal.media/files/koala/pUQbC18DsP4KxcIBA53y2_image.svg"}



**Example Response**:

```json
{
  "image": {
    "file_size": 85336,
    "file_name": "image.svg",
    "content_type": "image/svg+xml",
    "url": "https://v3.fal.media/files/koala/pUQbC18DsP4KxcIBA53y2_image.svg"
  }
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/recraft/vectorize \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "image_url": "https://storage.googleapis.com/falserverless/example_inputs/man_wave.png"
   }'
```

### Python

Ensure you have the Python client installed:

```bash
pip install fal-client
```

Then use the API client to make requests:

```python
import fal_client

def on_queue_update(update):
    if isinstance(update, fal_client.InProgress):
        for log in update.logs:
           print(log["message"])

result = fal_client.subscribe(
    "fal-ai/recraft/vectorize",
    arguments={
        "image_url": "https://storage.googleapis.com/falserverless/example_inputs/man_wave.png"
    },
    with_logs=True,
    on_queue_update=on_queue_update,
)
print(result)
```

### JavaScript

Ensure you have the JavaScript client installed:

```bash
npm install --save @fal-ai/client
```

Then use the API client to make requests:

```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/recraft/vectorize", {
  input: {
    image_url: "https://storage.googleapis.com/falserverless/example_inputs/man_wave.png"
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  },
});
console.log(result.data);
console.log(result.requestId);
```


## Additional Resources

### Documentation

- [Model Playground](https://fal.ai/models/fal-ai/recraft/vectorize)
- [API Documentation](https://fal.ai/models/fal-ai/recraft/vectorize/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/recraft/vectorize)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)