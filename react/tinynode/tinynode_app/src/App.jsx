import React, { useState, useRef } from 'react';
import Confetti from 'react-confetti';

// ======================
// Mock data ban đầu
// ======================

const initialTotalGems = 120;

const initialHistory = [
  {
    id: 1,
    type: 'add',
    amount: 10,
    reason: 'Nộp bài Toán lần 1 (mock)',
    timestamp: '2026-03-18 20:30',
  },
  {
    id: 2,
    type: 'subtract',
    amount: 30,
    reason: 'Đổi quà: Bộ bút màu (mock)',
    timestamp: '2026-03-17 19:10',
  },
  {
    id: 3,
    type: 'add',
    amount: 20,
    reason: 'Hoàn thành bài tiếng Anh (mock)',
    timestamp: '2026-03-16 18:45',
  },
];

// ======================
// Các hàm TODO để bạn tích hợp API thật
// ======================

export async function handleImageUpload(file) {
  // TODO: Upload ảnh bài làm lên storage (Firebase, Cloudinary, Google Drive, ...)
  console.log('handleImageUpload - TODO: upload ảnh lên storage', file);
  // return URL ảnh sau khi upload (khi bạn tích hợp thật)
  return null;
}

export async function callGeminiAPI(message, context) {
  const API_KEY = import.meta.env.VITE_GEMINI_KEY;
  const SYSTEM_PROMPT = import.meta.env.VITE_SYSTEM_PROMPT; // Lấy prompt từ .env

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;
  

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: "user", // Gemini Flash coi system prompt là một phần bối cảnh của user hoặc dùng system_instruction
            parts: [{ text: `${SYSTEM_PROMPT}\n\nNgữ cảnh hiện tại: Bé đang có ${context.totalGems} Gem.\nCâu hỏi của bé: ${message}` }]
          }
        ]
      })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.log(error)
    return "Hệ thống đang bảo trì, Nhà thám hiểm đợi tí nhé! 🛠️";
  }
}

export async function saveToGoogleSheets(payload) {
  // TODO: Ghi log bài nộp / lịch sử Gem vào Google Sheets
  console.log('saveToGoogleSheets - TODO: ghi vào Google Sheets', payload);
}

// ======================
// Component chính
// ======================

function App() {
  const [mode, setMode] = useState('student'); // 'student' | 'parent'
  const [totalGems, setTotalGems] = useState(initialTotalGems);
  const [history, setHistory] = useState(initialHistory);

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      from: 'ai',
      text: 'Xin chào bé! Hôm nay mình học gì nào? 😊',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isConfetti, setIsConfetti] = useState(false);

  // ======================
  // Logic Confetti
  // ======================
  const triggerConfetti = () => {
    setIsConfetti(true);
    setTimeout(() => setIsConfetti(false), 2500);
  };

  // ======================
  // Logic Chat AI (mock)
  // ======================
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const userMsg = {
      id: Date.now(),
      from: 'student',
      text: trimmed,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    // Gọi AI (Gemini) - hiện tại mock
    const aiText =
      (await callGeminiAPI(trimmed, { totalGems })) ||
      'AI sẽ trả lời ở đây sau khi bạn kết nối Gemini API.';

    const aiMsg = {
      id: Date.now() + 1,
      from: 'ai',
      text: aiText,
    };

    setChatMessages((prev) => [...prev, aiMsg]);
  };

  // ======================
  // Logic nộp bài (Cộng Gem) - cho màn Học sinh
  // ======================
  const handleSubmitAssignment = (options = {}) => {
    // Bạn có thể truyền amount từ options nếu muốn tuỳ chỉnh
    const delta = options.amount ?? 10;

    setTotalGems((prev) => prev + delta);

    const entry = {
      id: Date.now(),
      type: 'add',
      amount: delta,
      reason: options.reason || 'Nộp bài (mock)',
      timestamp: new Date().toLocaleString(),
    };

    setHistory((prev) => [entry, ...prev]);

    triggerConfetti();
  };

  // ======================
  // Logic quy đổi quà (Trừ Gem) - cho màn Phụ huynh
  // ======================
  const handleRedeem = (giftName, gemToSubtract) => {
    const amount = Number(gemToSubtract);

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      alert('Vui lòng nhập số Gem hợp lệ.');
      return;
    }

    if (amount > totalGems) {
      alert('Số Gem hiện tại không đủ để quy đổi.');
      return;
    }

    setTotalGems((prev) => prev - amount);

    const entry = {
      id: Date.now(),
      type: 'subtract',
      amount,
      reason: `Đổi quà: ${giftName || 'Không tên'}`,
      timestamp: new Date().toLocaleString(),
    };

    setHistory((prev) => [entry, ...prev]);
  };

  return (
    <div className="min-h-screen flex justify-center bg-gradient-to-b from-yellow-50 via-orange-50 to-green-100">
      {/* Confetti overlay */}
      {isConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti numberOfPieces={220} recycle={false} />
        </div>
      )}

      <div className="w-full max-w-md px-4 py-4 flex flex-col gap-4">
        {/* Header + Switch mode */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-brandOrange tracking-tight drop-shadow-sm">
              TinyNode
            </h1>
            <p className="text-xs text-slate-600">
              Gamified học tập cho bé 🎮✨
            </p>
          </div>

          <div className="bg-white/80 rounded-full p-1 flex shadow-inner">
            <button
              type="button"
              onClick={() => setMode('student')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                mode === 'student'
                  ? 'bg-brandGreen text-white shadow-md'
                  : 'text-slate-500'
              }`}
            >
              Học sinh
            </button>
            <button
              type="button"
              onClick={() => setMode('parent')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                mode === 'parent'
                  ? 'bg-brandOrange text-white shadow-md'
                  : 'text-slate-500'
              }`}
            >
              Phụ huynh
            </button>
          </div>
        </header>

        {/* Nội dung màn hình */}
        <main className="flex-1 flex flex-col mt-1 mb-2">
          {mode === 'student' ? (
            <StudentScreen
              totalGems={totalGems}
              chatMessages={chatMessages}
              chatInput={chatInput}
              onChatChange={setChatInput}
              onChatSubmit={handleChatSubmit}
              onSubmitAssignment={handleSubmitAssignment}
            />
          ) : (
            <ParentScreen
              totalGems={totalGems}
              history={history}
              onRedeem={handleRedeem}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// ======================
// Màn hình HỌC SINH
// ======================

function StudentScreen({
  totalGems,
  chatMessages,
  chatInput,
  onChatChange,
  onChatSubmit,
  onSubmitAssignment,
}) {
  const fileInputRef = useRef(null);

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadedUrl = await handleImageUpload(file);

    await saveToGoogleSheets({
      type: 'assignment',
      fileName: file.name,
      uploadedUrl,
      submittedAt: new Date().toISOString(),
    });

    onSubmitAssignment({
      amount: 10,
      reason: 'Nộp bài qua TinyNode (mock)',
    });

    // Reset input để lần sau chọn lại được
    event.target.value = '';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Khung tổng Gem to, đẹp */}
      <section className="bg-gradient-to-r from-brandYellow to-brandOrange rounded-3xl shadow-lg p-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">
            Tổng Gem của bé
          </span>
          <span className="text-4xl font-black text-white drop-shadow-sm">
            {totalGems}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-4xl">💎</span>
          <span className="text-[10px] font-semibold text-white/90">
            Cố lên nào!
          </span>
        </div>
      </section>

      {/* Khung Chat với AI */}
      <section className="flex flex-col bg-white/90 rounded-3xl shadow-lg p-3 h-[320px]">
        <h2 className="text-sm font-semibold text-slate-700 mb-1">
          Chat với trợ lý Tiny AI
        </h2>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[85%] text-xs px-3 py-2 rounded-2xl shadow-sm ${
                msg.from === 'student'
                  ? 'ml-auto bg-brandGreen text-white rounded-br-sm'
                  : 'mr-auto bg-slate-100 text-slate-800 rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <form
          onSubmit={onChatSubmit}
          className="mt-2 flex items-center gap-2"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => onChatChange(e.target.value)}
            placeholder="Hỏi AI về bài tập..."
            className="flex-1 text-xs rounded-2xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brandGreen"
          />
          <button
            type="submit"
            className="shrink-0 px-3 py-2 text-xs font-semibold rounded-2xl bg-brandGreen text-white shadow-lg active:scale-95 transition-transform"
          >
            Gửi
          </button>
        </form>
      </section>

      {/* Nút Camera to ở giữa */}
      <section className="flex flex-col items-center mt-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={handleCameraClick}
          className="w-24 h-24 rounded-full bg-white shadow-[0_15px_40px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center border-4 border-brandGreen active:scale-95 transition-transform"
        >
          <span className="text-3xl">📷</span>
          <span className="text-[10px] font-semibold text-slate-700 mt-1">
            Chụp ảnh
          </span>
        </button>
        <p className="mt-2 text-[11px] text-slate-600 text-center max-w-xs">
          Bấm nút camera để chụp ảnh bài làm và nộp bài, bé sẽ được cộng Gem
          thưởng!
        </p>
      </section>
    </div>
  );
}

// ======================
// Màn hình PHỤ HUYNH
// ======================

function ParentScreen({ totalGems, history, onRedeem }) {
  const [giftName, setGiftName] = useState('');
  const [gemToSubtract, setGemToSubtract] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onRedeem(giftName, gemToSubtract);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Tổng Gem (mini summary) */}
      <section className="bg-white/90 rounded-3xl shadow-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Tổng Gem hiện tại
          </p>
          <p className="text-3xl font-black text-brandGreen">
            {totalGems}
          </p>
        </div>
        <span className="text-3xl">👨‍👩‍👧</span>
      </section>

      {/* Lịch sử Gem */}
      <section className="bg-white/90 rounded-3xl shadow-lg p-3 flex flex-col max-h-72">
        <h2 className="text-sm font-semibold text-slate-700 mb-2">
          Lịch sử biến động Gem
        </h2>
        <ul className="space-y-2 overflow-y-auto pr-1">
          {history.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl px-3 py-2 bg-slate-50 flex items-start justify-between gap-2 shadow-sm"
            >
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-800">
                  {item.type === 'add' ? 'Cộng Gem' : 'Trừ Gem'} ·{' '}
                  {item.amount}
                </p>
                <p className="text-[11px] text-slate-600">
                  {item.reason}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {item.timestamp}
                </p>
              </div>
              <span
                className={`text-xs font-bold mt-1 ${
                  item.type === 'add'
                    ? 'text-brandGreen'
                    : 'text-brandOrange'
                }`}
              >
                {item.type === 'add' ? `+${item.amount}` : `-${item.amount}`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Form quy đổi quà */}
      <section className="bg-gradient-to-r from-brandGreen to-brandOrange rounded-3xl shadow-lg p-4 text-white">
        <h2 className="text-sm font-semibold mb-2">
          Quy đổi Gem thành quà tặng
        </h2>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2"
        >
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide">
              Tên quà tặng
            </label>
            <input
              type="text"
              value={giftName}
              onChange={(e) => setGiftName(e.target.value)}
              placeholder="VD: Lego, sách truyện..."
              className="text-xs rounded-2xl px-3 py-2 text-slate-800 border border-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide">
              Số Gem trừ
            </label>
            <input
              type="number"
              min={1}
              value={gemToSubtract}
              onChange={(e) => setGemToSubtract(e.target.value)}
              placeholder="VD: 30"
              className="text-xs rounded-2xl px-3 py-2 text-slate-800 border border-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full py-2 text-xs font-bold rounded-2xl bg-white text-brandOrange shadow-lg active:scale-95 transition-transform"
          >
            Quy đổi
          </button>
        </form>
        <p className="mt-2 text-[10px] text-white/90">
          * Logic hiện tại là mock, chưa kết nối bất kỳ API thanh toán/thưởng
          thực tế nào.
        </p>
      </section>
    </div>
  );
}

export default App;
