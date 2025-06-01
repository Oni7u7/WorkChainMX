import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "../../artifacts/contracts/ImageUploader.sol/ImageUploader.json";
import { useNavigate } from 'react-router-dom';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

// Cambia por la dirección real de tu contrato desplegado
const contractAddress = "0x68B7207390fd7a599cB4f20EeD824E58052fbEd6";

const DocumentosUploader = () => {
  const [imageURI, setImageURI] = useState("");
  const [uploadFee, setUploadFee] = useState("0");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Cargar la tarifa de subida y las imágenes
  useEffect(() => {
    const fetchData = async () => {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi.abi, provider);
      const fee = await contract.uploadFee();
      setUploadFee(ethers.formatEther(fee));
      const total = await contract.totalImages();
      let imgs = [];
      for (let i = 0; i < Number(total); i++) {
        const img = await contract.getImage(i);
        imgs.push(img);
      }
      setImages(imgs);
    };
    fetchData();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!window.ethereum) {
      alert("MetaMask no está instalado");
      return;
    }
    setLoading(true);
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi.abi, signer);
      const fee = await contract.uploadFee();
      const tx = await contract.uploadImage(imageURI, { value: fee });
      await tx.wait();
      alert("¡Imagen subida!");
      window.location.reload();
    } catch (err) {
      alert("Error al subir la imagen: " + (err?.reason || err?.message));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 mb-6 self-start"
      >
        <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-gray-400" />
        Volver al Dashboard
      </button>
      <h1 className="text-3xl font-bold mb-8 text-primary-700">Subir Imagen</h1>
      <form onSubmit={handleUpload} className="bg-white rounded-xl shadow-lg p-8 mb-8 w-full max-w-md">
        <label className="block mb-2 text-gray-700 font-medium">Enlace de la imagen (IPFS o URL pública):</label>
        <input
          type="text"
          value={imageURI}
          onChange={e => setImageURI(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          placeholder="https://ipfs.io/ipfs/..."
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition"
        >
          {loading ? "Subiendo..." : `Subir (Fee: ${uploadFee} DEV)`}
        </button>
      </form>
      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Imágenes Subidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="bg-white rounded shadow p-2 flex flex-col items-center">
              {img.imageURI.endsWith('.pdf') ? (
                <a href={img.imageURI} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver PDF</a>
              ) : (
                <img src={img.imageURI} alt={`img-${idx}`} className="w-32 h-32 object-cover mb-2" />
              )}
              <span className="text-xs text-gray-400">Por: {img.uploader.slice(0, 6)}...{img.uploader.slice(-4)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentosUploader; 