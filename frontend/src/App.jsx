import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const starterMessages = [
  {
    role: "assistant",
    text:
      "Hello, I am SilverBridge. Ask me what support you may qualify for, or tell me what a caseworker asked you to do.",
  },
];

const quickPrompts = [
  "Can I get help paying my utility bill?",
  "What documents do I still need?",
  "I called the support office yesterday.",
  "I have no money for medicine.",
];

const profileDefaults = {
  age: "72",
  income: "Low fixed income",
  living: "Lives alone",
  needs: "Utility bills, food assistance, medical costs",
  location: "United States",
};

function App() {
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState("");
  const [profile, setProfile] = useState(profileDefaults);
  const [memories, setMemories] = useState([]);
  const [caseNote, setCaseNote] = useState("");
  const [eligibilityResult, setEligibilityResult] = useState("");
  const [status, setStatus] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  const supportsSpeechRecognition = useMemo(() => {
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);

  const supportsSpeechSynthesis = useMemo(() => {
    return "speechSynthesis" in window;
  }, []);

  const profileSummary = useMemo(() => {
    return [
      `Age: ${profile.age}`,
      `Location: ${profile.location}`,
      `Living situation: ${profile.living}`,
      `Income: ${profile.income}`,
      `Needs: ${profile.needs}`,
    ].join("\n");
  }, [profile]);

  useEffect(() => {
    fetchMemories();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function requestJson(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
  }

  async function fetchMemories() {
    try {
      const data = await requestJson("/memories");
      setMemories(Array.isArray(data) ? data.slice().reverse() : []);
    } catch {
      setStatus("Memory list is unavailable. Start the backend to load saved notes.");
    }
  }

  function speak(text) {
    if (!isSpeaking || !supportsSpeechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  async function sendMessage(messageText = input) {
    const trimmed = messageText.trim();
    if (!trimmed || isLoading) return;

    const userMessage = { role: "user", text: trimmed };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);
    setStatus("SilverBridge is thinking...");

    try {
      const urgent = isUrgent(trimmed);
      const data = await requestJson("/chat", {
        method: "POST",
        body: JSON.stringify({ message: trimmed }),
      });

      const answer = buildSafeResponse(data.response, urgent);
      setMessages((current) => [...current, { role: "assistant", text: answer }]);
      speak(answer);
      setStatus(urgent ? "Urgent need detected. Emergency options are shown." : "");
      fetchMemories();
    } catch (error) {
      const fallback =
        "I could not reach the AI backend. Please make sure FastAPI is running on port 8000.";
      setMessages((current) => [...current, { role: "assistant", text: fallback }]);
      setStatus(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function runEligibilityCheck() {
    setIsLoading(true);
    setStatus("Checking likely support programs...");
    setEligibilityResult("");

    try {
      const data = await requestJson("/eligibility", {
        method: "POST",
        body: JSON.stringify({ situation: profileSummary }),
      });

      const safeResult = buildSafeResponse(data.response);
      setEligibilityResult(safeResult);
      speak("I found some programs you may want to review. Please verify them with the official office.");
      fetchMemories();
      setStatus("");
    } catch (error) {
      setEligibilityResult(
        "Eligibility check could not run. Make sure the backend is running and GEMINI_API_KEY is configured."
      );
      setStatus(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveCaseNote() {
    const trimmed = caseNote.trim();
    if (!trimmed) return;

    setStatus("Saving case note...");
    try {
      await requestJson("/memory", {
        method: "POST",
        body: JSON.stringify({ text: trimmed, category: "case-tracking" }),
      });
      setCaseNote("");
      await fetchMemories();
      setStatus("Saved. SilverBridge can remember this later.");
    } catch (error) {
      setStatus(`Could not save note: ${error.message}`);
    }
  }

  function startListening() {
    if (!supportsSpeechRecognition || isListening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("Listening...");
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setInput(transcript);
      setStatus("Voice captured. Press Send or speak again.");
    };

    recognition.onerror = () => {
      setStatus("Voice input was not available. You can still type your message.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  function updateProfile(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">USAII Global AI Hackathon 2026</p>
          <h1>SilverBridge AI</h1>
          <p className="hero-text">
            A voice-first benefits navigator that helps seniors discover support,
            remember next steps, and stay in control.
          </p>
        </div>
        <div className="hero-card" aria-label="Responsible AI guardrail">
          <span>Responsible AI guardrail</span>
          <strong>Guidance only, not final eligibility.</strong>
          <p>SilverBridge says "may qualify" and points users to official verification.</p>
        </div>
      </section>

      <section className="layout-grid">
        <aside className="panel profile-panel">
          <div className="panel-heading">
            <p className="eyebrow">Step 1</p>
            <h2>Senior Profile</h2>
          </div>
          <label>
            Age
            <input
              value={profile.age}
              onChange={(event) => updateProfile("age", event.target.value)}
              placeholder="Example: 72"
            />
          </label>
          <label>
            Location
            <input
              value={profile.location}
              onChange={(event) => updateProfile("location", event.target.value)}
              placeholder="City or state"
            />
          </label>
          <label>
            Living situation
            <input
              value={profile.living}
              onChange={(event) => updateProfile("living", event.target.value)}
              placeholder="Lives alone"
            />
          </label>
          <label>
            Income
            <input
              value={profile.income}
              onChange={(event) => updateProfile("income", event.target.value)}
              placeholder="Fixed income, retired, etc."
            />
          </label>
          <label>
            Main needs
            <textarea
              value={profile.needs}
              onChange={(event) => updateProfile("needs", event.target.value)}
              placeholder="Utility bills, food, transport"
            />
          </label>
          <button className="primary-button" onClick={runEligibilityCheck} disabled={isLoading}>
            Check Support Options
          </button>
        </aside>

        <section className="panel chat-panel">
          <div className="panel-heading row-heading">
            <div>
              <p className="eyebrow">Step 2</p>
              <h2>Voice Assistant</h2>
            </div>
            <button
              className={`speech-toggle ${isSpeaking ? "active" : ""}`}
              onClick={() => setIsSpeaking((current) => !current)}
              type="button"
            >
              Voice replies {isSpeaking ? "on" : "off"}
            </button>
          </div>

          <div className="quick-prompts" aria-label="Example questions">
            {quickPrompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => sendMessage(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <div className="messages" aria-live="polite">
            {messages.map((message, index) => (
              <article className={`message ${message.role}`} key={`${message.role}-${index}`}>
                <span>{message.role === "assistant" ? "SilverBridge" : "You"}</span>
                <p>{message.text}</p>
              </article>
            ))}
            {isLoading && (
              <article className="message assistant">
                <span>SilverBridge</span>
                <p>Thinking through the safest next step...</p>
              </article>
            )}
            <div ref={chatEndRef} />
          </div>

          <form
            className="composer"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <button
              className="mic-button"
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={!supportsSpeechRecognition}
            >
              {isListening ? "Stop" : "Speak"}
            </button>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                supportsSpeechRecognition
                  ? "Speak or type your question..."
                  : "Type your question..."
              }
            />
            <button className="send-button" type="submit" disabled={isLoading}>
              Send
            </button>
          </form>

          {!supportsSpeechRecognition && (
            <p className="support-note">
              Voice input is not supported in this browser. The typed demo still works.
            </p>
          )}
        </section>

        <aside className="panel memory-panel">
          <div className="panel-heading">
            <p className="eyebrow">Step 3</p>
            <h2>Case Memory</h2>
          </div>
          <textarea
            className="case-note"
            value={caseNote}
            onChange={(event) => setCaseNote(event.target.value)}
            placeholder="Example: Caseworker asked me to submit proof of income by Friday."
          />
          <button className="secondary-button" onClick={saveCaseNote}>
            Save Case Note
          </button>
          <div className="memory-list">
            {memories.length === 0 ? (
              <p>No saved case notes yet.</p>
            ) : (
              memories.slice(0, 6).map((memory) => (
                <article key={memory.id} className="memory-item">
                  <span>{memory.category}</span>
                  <p>{memory.text}</p>
                </article>
              ))
            )}
          </div>
        </aside>
      </section>

      <section className="bottom-grid">
        <article className="panel results-panel">
          <div className="panel-heading">
            <p className="eyebrow">Eligibility Navigator</p>
            <h2>Likely Support Options</h2>
          </div>
          {eligibilityResult ? (
            <pre>{eligibilityResult}</pre>
          ) : (
            <p>
              Run the profile check to show likely programs, missing information,
              documents needed, and next steps.
            </p>
          )}
        </article>

        <article className="panel emergency-panel">
          <div className="panel-heading">
            <p className="eyebrow">Emergency Escalation</p>
            <h2>Urgent Need Support</h2>
          </div>
          <p>
            If a user mentions medicine, food, housing, or safety emergencies,
            SilverBridge surfaces immediate options and asks for confirmation before action.
          </p>
          <div className="emergency-actions">
            <a href="tel:211">Call 211</a>
            <a href="tel:911">Call 911</a>
            <button type="button" onClick={() => sendMessage("I need urgent help finding medicine support.")}>
              Find urgent medicine support
            </button>
          </div>
        </article>
      </section>

      {status && <div className="status-banner">{status}</div>}
    </main>
  );
}

function isUrgent(text) {
  const urgentWords = ["emergency", "urgent", "medicine", "no money", "unsafe", "eviction", "hungry"];
  return urgentWords.some((word) => text.toLowerCase().includes(word));
}

function buildSafeResponse(response, urgent = false) {
  const safePrefix =
    "Important: I can explain likely options, but an official agency or caseworker must confirm final eligibility.\n\n";
  const urgentText = urgent
    ? "\n\nBecause this may be urgent, consider calling 211 for local support. If there is immediate danger, call emergency services."
    : "";
  const cleanResponse = stripMarkdownStars(response || "I could not generate a response.");
  return `${safePrefix}${cleanResponse}${urgentText}`;
}

function stripMarkdownStars(text) {
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^\s*\*\s+/gm, "• ")
    .replace(/\*(.*?)\*/g, "$1");
}

export default App;
