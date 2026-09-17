import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import './App.css'

interface ApiResponse {
  method: string;
  status: string;
  data?: any;
  error?: string;
}

const iframeDocument = `<!doctype html><script>
addEventListener('message', async ({data:{method}={}}) => { if (!method) return;
 const options=method==='POST'?{method:'POST',headers:{'Content-Type':'application/json; charset=UTF-8'},body:JSON.stringify({title:'Iframe post',body:'This request was made inside an iframe',userId:1})}:{};
 try { const response=await fetch('https://jsonplaceholder.typicode.com/posts'+(method==='GET'?'/1?test=1234,123':''),options), data=await response.json(); if(!response.ok) throw Error(data.message||'Request failed with status '+response.status); parent.postMessage({type:'iframe-result',method,status:'Success',data},'*'); }
 catch(error) { parent.postMessage({type:'iframe-result',method,status:'Error',error:error.message},'*'); }
});</script>`;

const App = () => {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const receive = (event: MessageEvent<ApiResponse & { type?: string }>) => {
      if (event.source === iframeRef.current?.contentWindow && event.data?.type === "iframe-result") {
        setResponse(event.data);
        setLoading(false);
      }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);

  const handleIframeRequest = (method: "GET" | "POST") => {
    setLoading(true);
    setResponse(null);
    iframeRef.current?.contentWindow?.postMessage({ method }, "*");
  };

  const apiBaseUrl = "https://jsonplaceholder.typicode.com";

  // GET request - Fetch a post
  const handleGetRequest = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/posts/1?test=1234,123`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || `Request failed with status ${res.status}`);
      }
      setResponse({
        method: "GET",
        status: "Success",
        data: data,
      });
    } catch (error: any) {
      setResponse({
        method: "GET",
        status: "Error",
        error: error.message,
      });
    }
    setLoading(false);
  };

  // POST request - Create a new post
  const handlePostRequest = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/posts`, {
        method: "POST",
        body: JSON.stringify({
          title: "New Post Title",
          body: "This is a new post created via POST request",
          userId: 1,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || `Request failed with status ${res.status}`);
      }
      setResponse({
        method: "POST",
        status: "Success",
        data: data,
      });
    } catch (error: any) {
      setResponse({
        method: "POST",
        status: "Error",
        error: error.message,
      });
    }
    setLoading(false);
  };

  // PUT request - Update a post
  const handlePutRequest = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/posts/1`, {
        method: "PUT",
        body: JSON.stringify({
          id: 1,
          title: "Updated Post Title",
          body: "This post has been updated via PUT request",
          userId: 1,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || `Request failed with status ${res.status}`);
      }
      setResponse({
        method: "PUT",
        status: "Success",
        data: data,
      });
    } catch (error: any) {
      setResponse({
        method: "PUT",
        status: "Error",
        error: error.message,
      });
    }
    setLoading(false);
  };

  // DELETE request - Delete a post
  const handleDeleteRequest = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/posts/1`, {
        method: "DELETE",
      });
      const responseText = await res.text();
      const data = responseText ? JSON.parse(responseText) : null;
      if (!res.ok) {
        throw new Error(data?.message || data?.error || `Request failed with status ${res.status}`);
      }
      setResponse({
        method: "DELETE",
        status: "Success",
        data: data || { message: "Post deleted successfully" },
      });
    } catch (error: any) {
      setResponse({
        method: "DELETE",
        status: "Error",
        error: error.message,
      });
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1 className="title">JSONPlaceholder API Demo</h1>
      <p className="subtitle">Test different HTTP methods</p>

      <Link className="flow-entry" to="/flow/profile">
        Open Multi-Step Flow
      </Link>

      <div className="button-group">
        <button className="btn btn-iframe" onClick={() => handleIframeRequest("GET")} disabled={loading}>
          Iframe GET Request
        </button>
        <button className="btn btn-iframe" onClick={() => handleIframeRequest("POST")} disabled={loading}>
          Iframe POST Request
        </button>
        <button
          className="btn btn-get"
          onClick={handleGetRequest}
          disabled={loading}
        >
          📥 GET Request
        </button>
        <button
          className="btn btn-post"
          onClick={handlePostRequest}
          disabled={loading}
        >
          ➕ POST Request
        </button>
        <button
          className="btn btn-put"
          onClick={handlePutRequest}
          disabled={loading}
        >
          ✏️ PUT Request
        </button>
        <button
          className="btn btn-delete"
          onClick={handleDeleteRequest}
          disabled={loading}
        >
          🗑️ DELETE Request
        </button>
      </div>

      <iframe ref={iframeRef} srcDoc={iframeDocument} sandbox="allow-scripts" title="Iframe API requests" className="api-frame" />

      {loading && <div className="loading">Loading...</div>}

      {response && (
        <div className="response-container">
          <div className={`response ${response.status.toLowerCase()}`}>
            <h2>
              {response.method} Request - {response.status}
            </h2>
            {response.error ? (
              <div className="error-message">
                <strong>Error:</strong> {response.error}
              </div>
            ) : (
              <pre className="json-output">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
