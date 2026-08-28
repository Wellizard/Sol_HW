import React, { useState } from 'react';
import { ethers } from 'ethers';
import VotingArtifact from './contracts/VotingSystem.json';

const CONTRACT_ADDRESS = "0x0AF20819c7AbD6901EBd2E7B47333B7D62CFFF81";
const CONTRACT_ABI = VotingArtifact.abi;

function App() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [winner, setWinner] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [voteName, setVoteName] = useState("");

  // НОВЕ: Стан для зберігання списку кандидатів
  const [candidatesList, setCandidatesList] = useState([]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        const votingContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        setContract(votingContract);

        updateBalance(provider);
        // НОВЕ: Завантажуємо кандидатів при підключенні
        fetchCandidates(votingContract);
      } catch (error) {
        console.error("Помилка підключення", error);
      }
    } else {
      alert("Будь ласка, встановіть MetaMask!");
    }
  };

  const updateBalance = async (provider) => {
    const contractBalance = await provider.getBalance(CONTRACT_ADDRESS);
    setBalance(ethers.formatEther(contractBalance));
  };

  // НОВЕ: Функція для отримання масиву кандидатів з контракту
  const fetchCandidates = async (votingContract) => {
    try {
      const data = await votingContract.getAllCandidates();

      // Форматуємо дані (оскільки числа в смарт-контрактах повертаються як BigInt)
      const formattedCandidates = data.map((candidate, index) => ({
        id: index,
        name: candidate.name,
        voteCount: candidate.voteCount.toString()
      }));

      setCandidatesList(formattedCandidates);
    } catch (error) {
      console.error("Помилка завантаження кандидатів:", error);
    }
  };

  const handleAddCandidate = async () => {
    if (!contract) return;
    try {
      const fee = await contract.candidateFee();
      const tx = await contract.addCandidate(candidateName, { value: fee });
      await tx.wait(); // Чекаємо підтвердження транзакції

      alert("Кандидата успішно додано!");
      updateBalance(contract.runner.provider);
      fetchCandidates(contract); // НОВЕ: Оновлюємо список
    } catch (error) {
      console.error(error);
      alert("Помилка додавання. Можливо, кандидат вже існує або відхилено транзакцію.");
    }
  };

  const handleVote = async () => {
    if (!contract) return;
    try {
      const tx = await contract.vote(voteName);
      await tx.wait(); // Чекаємо підтвердження

      alert("Ваш голос враховано!");
      fetchCandidates(contract); // НОВЕ: Оновлюємо список після голосування
    } catch (error) {
      console.error(error);
      alert("Помилка голосування. Можливо, ви вже голосували.");
    }
  };

  const handleGetWinner = async () => {
    if (!contract) return;
    try {
      const winnerName = await contract.getWinner();
      setWinner(winnerName);
    } catch (error) {
      console.error(error);
      alert("Тільки власник контракту може визначати переможця.");
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>DApp Система Голосування</h2>

      {!account ? (
        <button onClick={connectWallet} style={{ width: '100%', padding: '10px' }}>Підключити гаманець</button>
      ) : (
        <p>Підключений акаунт: <br /> <strong>{account}</strong></p>
      )}

      <hr />
      <h3>Баланс контракту: {balance} ETH</h3>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h4>Додати кандидата</h4>
        <input
          type="text"
          placeholder="Ім'я кандидата"
          value={candidateName}
          onChange={(e) => setCandidateName(e.target.value)}
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <button onClick={handleAddCandidate} style={{ padding: '8px 15px' }}>Додати</button>
      </div>

      {/* НОВИЙ БЛОК: Відображення списку */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h4>Список кандидатів</h4>
        {candidatesList.length === 0 ? (
          <p style={{ color: 'gray' }}>Кандидатів ще немає.</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {candidatesList.map((candidate) => (
              <li key={candidate.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <strong>{candidate.name}</strong> — Голосів: {candidate.voteCount}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h4>Проголосувати</h4>
        <input
          type="text"
          placeholder="Введіть ім'я зі списку"
          value={voteName}
          onChange={(e) => setVoteName(e.target.value)}
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <button onClick={handleVote} style={{ padding: '8px 15px' }}>Віддати голос</button>
      </div>

      <div style={{ padding: '15px', backgroundColor: '#eef7e6', borderRadius: '8px' }}>
        <h4>Результати</h4>
        <button onClick={handleGetWinner} style={{ padding: '8px 15px' }}>Визначити переможця</button>
        {winner && <h3 style={{ color: 'green', marginTop: '15px' }}>🏆 Переможець: {winner}</h3>}
      </div>
    </div>
  );
}

export default App;