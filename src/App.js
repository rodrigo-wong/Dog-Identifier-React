import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

const App = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setResult(null); // Reset result when a new image is uploaded

    // Set a preview URL for the uploaded image
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert("Please upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      setLoading(true);
      // Use environment variable for the API URL
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/predict`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Format breed: Replace underscores with spaces and capitalize each word
      const formattedBreed = response.data.breed
        .replace(/_/g, " ") // Replace underscores with spaces
        .split(" ") // Split the string into words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
        .join(" "); // Join the words back together

      setResult({ ...response.data, breed: formattedBreed });
    } catch (error) {
      console.error("Error uploading image:", error);
      setResult({ error: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Dog Breed Predictor</h1>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-3">
          <label htmlFor="imageUpload" className="form-label">
            Upload an Image
          </label>
          <input
            type="file"
            className="form-control"
            id="imageUpload"
            onChange={handleImageChange}
            accept="image/*"
          />
        </div>

        {preview && (
          <div className="mb-3 text-center">
            <h5>Preview:</h5>
            <img
              src={preview}
              alt="Uploaded Preview"
              className="img-thumbnail"
              style={{ maxHeight: "300px" }}
            />
          </div>
        )}

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Predicting..." : "Submit"}
        </button>
      </form>

      {result && (
        <div className="mt-4">
          {result.error ? (
            <div className="alert alert-danger" role="alert">
              {result.error}
            </div>
          ) : (
            <div className="alert alert-success" role="alert">
              <h4>Prediction Result</h4>
              <p><strong>Breed:</strong> {result.breed}</p>
              <p><strong>Confidence:</strong> {result.confidence}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
