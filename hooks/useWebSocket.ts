import { useEffect, useState } from 'react';

export const useWebSocket = (url: string) => {
  const [ws, setWs] = useState<WebSocket | null>(null);

  const sendMessage = (message: string) => {
    if (ws) {
      ws.send(message);
    }
  };

  useEffect(() => {
    const ws = new WebSocket(url);
    setWs(ws);

    // handle connection open
    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    // handle messages
    ws.onmessage = (event) => {
      console.log('Message received:', event.data);
    };

    // handle connection close
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    // handle connection error
    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
    };

    // handle connection close
    return () => {
      ws.close();
    };
  }, [url]);

  return { ws, sendMessage, isConnected: ws?.readyState === WebSocket.OPEN };
};
