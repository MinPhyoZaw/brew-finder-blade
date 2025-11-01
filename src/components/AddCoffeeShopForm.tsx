import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const TAG_OPTIONS = [
  { label: "First Date", value: "first_date", color: "bg-pink-400", icon: "💖" },
  { label: "Photograph", value: "photograph", color: "bg-blue-400", icon: "📸" },
  { label: "Relax & Chill", value: "relax_chill", color: "bg-green-400", icon: "🪷" },
  { label: "Study Spot", value: "study_spot", color: "bg-yellow-400", icon: "📚" },
  { label: "Group Hangout", value: "group_hangout", color: "bg-purple-400", icon: "👥" },
  { label: "Family", value: "family", color: "bg-orange-400", icon: "🏠" },
];

const PROVISIONS = [
  "Sanchaung", "Kamayut", "Insein", "Kyimyindaing", "Mayangone",
  "Mingaladon", "Bahan", "Tamwe", "Dagon", "Hlaing", "Ahlone", "Yankin",
  "Thingangyun", "South Okkalapa", "North Okkalapa", "Hlaingthaya",
  "Shwepyithar", "Dagon Seikkan", "North Dagon", "East Dagon", "South Dagon",
  "Lanmadaw", "Latha", "Pabedan", "Kyauktada", "Botataung", "Dawbon",
  "Thaketa", "Seikkan", "Dala", "Seikkyi Kanaungto", "Cocokyun"
];

export const AddCoffeeShopForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    provision: "",
    address: "",
    rating: "",
    phone: "",
    latitude: "",
    longitude: "",
    priceRange: "",
    imagesInput: "",
    description: "",
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleTag = (value: string) => {
    setSelectedTags(prev =>
      prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const imageArray = formData.imagesInput
        .split(",")
        .map(url => url.trim())
        .filter(url => url !== "");

      await addDoc(collection(db, "coffeeshops"), {
        ...formData,
        rating: parseFloat(formData.rating),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        priceRange: formData.priceRange,
        tags: selectedTags,
        images: imageArray,
        createdAt: new Date(),
      });

      setMessage("✅ Coffee shop added successfully!");
      setFormData({
        name: "",
        provision: "",
        address: "",
        rating: "",
        phone: "",
        latitude: "",
        longitude: "",
        priceRange: "",
        imagesInput: "",
        description: "",
      });
      setSelectedTags([]);
    } catch (error) {
      console.error("Error adding document: ", error);
      setMessage("❌ Failed to add coffee shop.");
    } finally {
      setLoading(false);
    }
  };

  // Preview first image
  const firstImageUrl = formData.imagesInput
    .split(",")
    .map(url => url.trim())
    .find(url => url !== "");

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-2xl mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Add Coffee Shop ☕
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Coffee Shop Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <select
          name="provision"
          value={formData.provision}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Township</option>
          {PROVISIONS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          step="0.1"
          name="rating"
          placeholder="Rating (0–5)"
          value={formData.rating}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            name="latitude"
            placeholder="Latitude"
            value={formData.latitude}
            onChange={handleChange}
            className="p-2 border rounded"
          />
          <input
            type="text"
            name="longitude"
            placeholder="Longitude"
            value={formData.longitude}
            onChange={handleChange}
            className="p-2 border rounded"
          />
        </div>

        <label className="block text-gray-700 font-medium mb-1">
          💵 Price Range (per person)
        </label>
        <select
          name="priceRange"
          value={formData.priceRange}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Price Range</option>
          <option value="MMK 5000 - 10000">MMK 5,000 – 10,000</option>
          <option value="MMK 10000 - 15000">MMK 10,000 – 15,000</option>
          <option value="Over MMK 20000">Over MMK 20,000</option>
        </select>

        {/* Description field */}
        <textarea
          name="description"
          placeholder="Description of the coffee shop"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded h-20"
        />

        {/* 🖼️ Image URLs input */}
        <textarea
          name="imagesInput"
          placeholder="Enter image URLs separated by commas"
          value={formData.imagesInput}
          onChange={handleChange}
          className="w-full p-2 border rounded h-20"
        />

        {/* Image preview */}
        {firstImageUrl && (
          <img
            src={firstImageUrl}
            alt="Preview"
            className="w-full h-48 object-cover rounded"
          />
        )}

        {/* 🌈 Tag Selector */}
        <div className="flex gap-2 overflow-x-auto py-2">
          {TAG_OPTIONS.map(tag => (
            <button
              type="button"
              key={tag.value}
              onClick={() => toggleTag(tag.value)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm whitespace-nowrap transition ${
                selectedTags.includes(tag.value)
                  ? `${tag.color} text-white`
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              <span>{tag.icon}</span>
              {tag.label}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
        >
          {loading ? "Adding..." : "Add Coffee Shop"}
        </button>
      </form>

      {message && <p className="text-center mt-4">{message}</p>}
    </div>
  );
};
