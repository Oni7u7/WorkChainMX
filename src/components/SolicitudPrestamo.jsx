import React from "react";
import { ethers } from "ethers";
import abi from "../../artifacts/contracts/NativeLoanWithPenalty.sol/NativeLoanWithPenalty.json";

// Reemplaza esta dirección por la real de tu contrato desplegado
const contractAddress = "0x78e82c0A20f03B6f1c78F8E8124E6f950dFc014F";

const SolicitudPrestamo = () => {
  const handleSolicitud = async () => {
    if (!window.ethereum) {
      alert("MetaMask no está instalado");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const { chainId } = await provider.getNetwork();
      if (chainId !== 1287) {
        alert("Por favor, selecciona la red Moonbase Alpha en MetaMask");
        return;
      }
      const contract = new ethers.Contract(contractAddress, abi.abi, signer);
      const tx = await contract.takeLoan();
      await tx.wait();
      alert("¡Solicitud enviada y préstamo tomado!");
    } catch (err) {
      alert("Error al interactuar con el contrato: " + (err?.reason || err?.message));
    }
  };

};

export default SolicitudPrestamo; 