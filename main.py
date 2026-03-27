from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates


app = FastAPI(redoc_url=None, docs_url=None, openapi_url=None)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={},
    )


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    message_number = 0

    try:
        while True:
            data = await websocket.receive_json()

            text = str(data.get("text", "")).strip()
            if not text:
                await websocket.send_json(
                    {
                        "type": "error",
                        "message": "нельзя отправлять пустое сообщение",
                    }
                )
                continue

            message_number += 1

            await websocket.send_json(
                {
                    "type": "message",
                    "number": message_number,
                    "text": text,
                }
            )
    except WebSocketDisconnect:
        pass