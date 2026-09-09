import React, { useState } from "react";
import './App.css'

interface ApiResponse {
  method: string;
  status: string;
  data?: any;
  error?: string;
}

const App = () => {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

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

      <div className="button-group">
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
