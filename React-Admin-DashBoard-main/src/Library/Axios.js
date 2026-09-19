import axios from "axios";

const axiosInstance = axios.create({
  // Development URL - change to production URL when deploying
  // baseURL: "http://localhost:5000/api",
  baseURL: "https://dd-qghb.onrender.com/api",
});

// Export base URL for image uploads (without /api)
export const getImageBaseUrl = () => {
  return axiosInstance.defaults.baseURL.replace("/api", "");
};

// Export function to get full attachment URL
export const getAttachmentUrl = (attachmentPath) => {
  if (!attachmentPath) return "";

  // If URL already includes http/https, return as is
  if (
    attachmentPath.startsWith("http://") ||
    attachmentPath.startsWith("https://")
  ) {
    return attachmentPath;
  }

  // If URL starts with blob: (for newly uploaded files), return as is
  if (attachmentPath.startsWith("blob:")) {
    return attachmentPath;
  }

  // Get base URL without /api
  const baseUrl = getImageBaseUrl();

  // Ensure proper URL construction
  const cleanPath = attachmentPath.startsWith("/")
    ? attachmentPath
    : `/${attachmentPath}`;
  return `${baseUrl}${cleanPath}`;
};

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("🔧 AXIOS REQUEST INTERCEPTOR:", {
      baseURL: config.baseURL,
      url: config.url,
      fullURL: config.baseURL + config.url,
      method: config.method?.toUpperCase(),
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + "..." : "NONE",
      headers: config.headers,
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ TOKEN ADDED TO REQUEST HEADERS");
    } else {
      console.log("❌ NO TOKEN FOUND IN LOCALSTORAGE");
    }
    return config;
  },
  (error) => {
    console.log("❌ AXIOS REQUEST ERROR:", error);
    return Promise.reject(error);
  },
);

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ AXIOS RESPONSE SUCCESS:", {
      status: response.status,
      url: response.config?.url,
      fullURL: response.config?.baseURL + response.config?.url,
      method: response.config?.method?.toUpperCase(),
      dataSize: JSON.stringify(response.data).length + " chars",
    });
    return response;
  },
  (error) => {
    console.log("🚨 AXIOS INTERCEPTOR - Response error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      fullURL: error.config?.baseURL + error.config?.url,
      method: error.config?.method?.toUpperCase(),
      pathname: window.location.pathname,
      hasToken: !!localStorage.getItem("token"),
      errorData: error.response?.data,
    });

    // Don't clear localStorage for 401 errors - let the AuthContext handle authentication state
    // The interceptor should only log errors, not manage authentication
    return Promise.reject(error);
  },
);

export default axiosInstance;
