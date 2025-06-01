import { useState, useEffect, useContext } from 'react';
import { ethers } from "ethers";
import abi from "../../artifacts/contracts/NativeLoanWithPenalty.sol/NativeLoanWithPenalty.json";
import { AuthContext } from '../App';

export const useLoanHistory = () => {
  const { user } = useContext(AuthContext);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      console.log('Iniciando fetchHistory...');
      console.log('User:', user);
      
      if (!window.ethereum || !user?.walletAddress) {
        console.log('No ethereum o wallet address');
        setLoans([]);
        setLoading(false);
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        console.log('Provider creado');

        const userLoanContracts = JSON.parse(localStorage.getItem(`loans_${user.walletAddress}`) || '[]');
        console.log('Contratos encontrados:', userLoanContracts);

        if (userLoanContracts.length === 0) {
          console.log('No hay contratos');
          setLoans([]);
          setLoading(false);
          return;
        }

        let loansData = [];

        for (const contractAddress of userLoanContracts) {
          try {
            console.log('Procesando contrato:', contractAddress);
            const contract = new ethers.Contract(contractAddress, abi.abi, provider);

            const allEvents = await contract.queryFilter("*", 0, "latest");
            console.log('Eventos encontrados:', allEvents.length);

            let loanState = {
              contractAddress: contractAddress,
              events: [],
              state: 'Unknown',
              loanAmount: '0',
              interestAmount: '0',
              totalDue: '0',
              amountRepaid: '0',
              dueDate: 'N/A'
            };

            allEvents.forEach(event => {
              if (['Funded', 'LoanTaken', 'PartialRepayment', 'FullyRepaid', 'PenaltyApplied'].includes(event.fragment.name)) {
                if (event.address.toLowerCase() === contractAddress.toLowerCase()) {
                  loanState.events.push({
                    type: event.fragment.name,
                    args: event.args,
                    timestamp: event.blockTimestamp
                  });

                  if (event.fragment.name === 'Funded') {
                    loanState.state = 'Funded';
                    loanState.loanAmount = ethers.formatEther(event.args.amount);
                    loanState.interestAmount = ethers.formatEther(event.args.interestAmount);
                    loanState.totalDue = ethers.formatEther(event.args.totalAmount);
                  } else if (event.fragment.name === 'LoanTaken') {
                    loanState.state = 'Taken';
                  } else if (event.fragment.name === 'PartialRepayment') {
                    loanState.amountRepaid = (parseFloat(loanState.amountRepaid) + parseFloat(ethers.formatEther(event.args.amount))).toFixed(4);
                  } else if (event.fragment.name === 'FullyRepaid') {
                    loanState.state = 'Repaid';
                    loanState.amountRepaid = loanState.totalDue;
                  } else if (event.fragment.name === 'PenaltyApplied') {
                    loanState.state = 'Defaulted';
                  }
                }
              }
            });

            loanState.events.sort((a, b) => a.timestamp - b.timestamp);

            try {
              const currentTotalDue = await contract.totalDue();
              loanState.totalDue = ethers.formatEther(currentTotalDue);

              const currentDueDate = await contract.dueDate();
              loanState.dueDate = Number(currentDueDate) * 1000;
            } catch (stateError) {
              console.warn(`No se pudo leer el estado del contrato ${contractAddress}:`, stateError);
            }

            loansData.push(loanState);
            console.log('Estado del préstamo procesado:', loanState);

          } catch (contractError) {
            console.error(`Error al procesar el contrato ${contractAddress}:`, contractError);
            loansData.push({
              contractAddress: contractAddress,
              events: [],
              state: 'Error',
              error: contractError.message
            });
          }
        }

        console.log('Datos finales de préstamos:', loansData);
        setLoans(loansData);

      } catch (err) {
        console.error("Error al obtener el historial:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  return { loans, loading, error };
}; 