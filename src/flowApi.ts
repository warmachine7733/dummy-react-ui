const apiBaseUrl = "https://jsonplaceholder.typicode.com";

export interface Profile {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
}

export interface Preference {
  id: number;
  title: string;
}

interface UserResponse extends Profile {
  address: Address;
}

interface TodoResponse {
  id: number;
  title: string;
}

const request = async <T,>(
  resource: string,
  flowEndpoint: string,
  options?: RequestInit
): Promise<T> => {
  const separator = resource.includes("?") ? "&" : "?";
  const response = await fetch(
    `${apiBaseUrl}${resource}${separator}flowEndpoint=${encodeURIComponent(flowEndpoint)}`,
    options
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data as T;
};

const jsonOptions = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-type": "application/json; charset=UTF-8" },
  body: JSON.stringify(body),
});

export const flowApi = {
  getProfile: () => request<Profile>("/users/1", "/api/flow/profile"),

  getAddress: async () => {
    const user = await request<UserResponse>("/users/1", "/api/flow/address");
    return user.address;
  },

  updateAddress: (address: Address) =>
    request<UserResponse>(
      "/users/1",
      "/api/flow/address",
      jsonOptions("PUT", { id: 1, address })
    ),

  getPreferences: async () => {
    const todos = await request<TodoResponse[]>(
      "/todos?userId=1&_limit=3",
      "/api/flow/preferences"
    );
    return todos.map(({ id, title }) => ({ id, title }));
  },

  updatePreference: (preference: Preference) =>
    request<TodoResponse>(
      `/todos/${preference.id}`,
      "/api/flow/preferences",
      jsonOptions("PATCH", { title: preference.title })
    ),

  getReviewProfile: () =>
    request<Profile>("/users/1", "/api/flow/review/profile"),

  getReviewAddress: async () => {
    const user = await request<UserResponse>(
      "/users/1",
      "/api/flow/review/address"
    );
    return user.address;
  },

  getReviewPreference: async (preferenceId = 1) => {
    const todo = await request<TodoResponse>(
      `/todos/${preferenceId}`,
      "/api/flow/review/preferences"
    );
    return { id: todo.id, title: todo.title };
  },

  complete: () =>
    request<{ id: number }>(
      "/posts",
      "/api/flow/complete",
      jsonOptions("POST", { userId: 1, completed: true })
    ),

  getStatus: () =>
    request<TodoResponse & { completed: boolean }>(
      "/todos/1",
      "/api/flow/status"
    ),
};