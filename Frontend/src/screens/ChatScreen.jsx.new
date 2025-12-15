import axios from "axios";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SocketDataContext } from "../contexts/SocketContext";
import Console from "../utils/console";
import Loading from "./Loading";
import { motion, AnimatePresence } from "framer-motion";
import { colors, shadows, glassEffect, borderRadius } from "../styles/designSystem";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";

// URL de sonido de notificación
const MESSAGE_SOUND = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";

// Variantes de animación para iOS Deluxe
const animationVariants = {
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } }
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { type: "spring", damping: 25, stiffness: 300 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  }
};

const playSound = () => {
  try {
    const audio = new Audio(MESSAGE_SOUND);
    audio.volume = 0.3;
    audio.play().catch(e => Console.log("Error reproduciendo sonido:", e));
  } catch (e) {
    Console.log("Error con audio:", e);
  }
};

function ChatScreen() {
  const { rideId, userType } = useParams();
  const navigation = useNavigate();
  const scrollableDivRef = useRef(null);
  const inputRef = useRef(null);

  const { socket } = useContext(SocketDataContext);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [error, setError] = useState(null);
  const typingTimeoutRef = useRef(null);

  // Safe JSON parsing with error handling
  const getCurrentUser = () => {
    try {
      const userDataString = localStorage.getItem("userData");
      if (!userDataString) return null;
      const userData = JSON.parse(userDataString);
      return userData?.data?._id || null;
    } catch (e) {
      Console.log("Error parsing user data:", e);
      return null;
    }
  };

  const currentUser = getCurrentUser();

  const scrollToBottom = () => {
    if (scrollableDivRef.current) {
      scrollableDivRef.current.scrollTop = scrollableDivRef.current.scrollHeight;
    }
  };

  const getUserDetails = useCallback(async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/ride/chat-details/${rideId}`
      );

      // Validate response data
      if (!response.data || !response.data.user || !response.data.captain) {
        Console.log("Invalid response data from server");
        setError("Error al cargar datos del chat");
        return;
      }

      // Proteger usuarios no autorizados de leer los chats
      if (currentUser !== response.data.user._id && currentUser !== response.data.captain._id) {
        Console.log("No estás autorizado para ver este chat.");
        navigation(-1);
        return;
      }
      
      // Validate messages array
      const validMessages = Array.isArray(response.data.messages) ? response.data.messages : [];
      setMessages(validMessages);

      socket.emit("join-room", rideId);
      if (userType === "user") {
        setUserData(response.data.captain);
      }
      if (userType === "captain") {
        setUserData(response.data.user);
      }
    } catch (error) {
      Console.log("Error fetching chat details:", error);
      setError("No se pudo cargar el chat. Por favor, intenta de nuevo.");
    }
  }, [rideId, currentUser, navigation, socket, userType]);

  const handleTyping = () => {
    socket.emit("typing", { rideId, userType });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", { rideId, userType });
    }, 1000);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      return;
    }

    try {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      socket.emit("message", { rideId: rideId, msg: message, userType: userType, time });
      socket.emit("stop-typing", { rideId, userType });
      setMessages((prev) => [...prev, { msg: message, by: userType, time, status: 'sent' }]);

      setMessage("");
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      Console.log("Error sending message:", error);
      setError("Error al enviar mensaje");
    }
  };

  useEffect(() => {
    scrollToBottom();
    setHasNewMessage(false);
  }, [messages]);

  useEffect(() => {
    if (userData) {
      scrollToBottom();
    }
  }, [userData]);

  // Load chat details on mount
  useEffect(() => {
    const loadChatDetails = async () => {
      await getUserDetails();
    };
    
    const timeoutId = setTimeout(() => {
      loadChatDetails();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [getUserDetails]);

  // Setup socket event listeners
  useEffect(() => {
    if (!socket || !rideId) return;

    const handleReceiveMessage = (data) => {
      try {
        if (!data || typeof data.msg !== 'string') {
          Console.log('Invalid message data received:', data);
          return;
        }

        const { msg, by, time } = data;
        
        setMessages((prev) => [...prev, { msg, by, time }]);
        playSound();
        setHasNewMessage(true);
        
        if (navigator.vibrate) {
          navigator.vibrate([100]);
        }
      } catch (error) {
        Console.log("Error handling received message:", error);
      }
    };

    const handleUserTyping = ({ userType: typingUser }) => {
      try {
        if (typingUser !== userType) {
          setIsTyping(true);
        }
      } catch (error) {
        Console.log("Error handling typing event:", error);
      }
    };

    const handleUserStopTyping = ({ userType: typingUser }) => {
      try {
        if (typingUser !== userType) {
          setIsTyping(false);
        }
      } catch (error) {
        Console.log("Error handling stop typing event:", error);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stop-typing", handleUserStopTyping);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stop-typing", handleUserStopTyping);
    };
  }, [socket, rideId, userType]);

  // Show error state with iOS Deluxe styling
  if (error) {
    return (
      <div className="flex flex-col h-dvh bg-gradient-to-br from-[#0A0A0A] via-[#101010] to-[#080808] items-center justify-center p-4">
        <Card
          variant="floating"
          borderRadius="xlarge"
          className="p-8 max-w-md w-full"
        >
          <div className="text-center">
            {/* Error Icon with Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-20 h-20 mx-auto mb-5"
            >
              <div className={`w-20 h-20 rounded-full bg-[#FEE2E2]/40 backdrop-blur-sm flex items-center justify-center mx-auto`}>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/80 to-red-400/60 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-3">Error en el chat</h2>
            <p className="text-white/70 mb-8">{error}</p>
            
            <div className="flex gap-4">
              <Button
                variant="primary"
                size="large"
                title="Reintentar"
                onClick={() => {
                  setError(null);
                  getUserDetails();
                }}
                className="flex-1"
              />
              <Button
                variant="glass"
                size="large"
                title="Volver"
                onClick={() => navigation(-1)}
                className="flex-1"
              />
            </div>
          </div>
        </Card>
      </div>
    );
  } else if (userData) {
    return (
      <div className="flex flex-col h-dvh bg-gradient-to-br from-[#0A0A0A] via-[#101010] to-[#080808]">
        {/* Header with iOS Deluxe styling */}
        <motion.div
          variants={animationVariants.fadeInDown}
          initial="initial"
          animate="animate"
          className="sticky top-0 z-20 backdrop-blur-xl border-b border-white/10"
        >
          <div className="px-4 py-3 flex items-center gap-3">
            {/* Back Button - iOS Deluxe */}
            <Button
              variant="glass"
              size="icon"
              icon={<ArrowLeft size={18} />}
              onClick={() => navigation(-1)}
              aria-label="Volver"
            />

            {/* Profile Image + Info - iOS Deluxe */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative w-10 h-10 flex-shrink-0">
                {userData?.profileImage ? (
                  <img
                    src={userData.profileImage}
                    alt={`${userData?.fullname?.firstname} ${userData?.fullname?.lastname}`}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextElementSibling) {
                        e.target.nextElementSibling.classList.remove('hidden');
                        e.target.nextElementSibling.classList.add('flex');
                      }
                    }}
                  />
                ) : null}
                <div 
                  className={`w-10 h-10 rounded-full bg-gradient-to-br from-[${colors.accent}] to-[${colors.accent}]/70 flex items-center justify-center ${userData?.profileImage ? 'hidden' : 'flex'}`}
                >
                  <span className="text-sm font-bold text-white">
                    {userData?.fullname?.firstname?.[0]}
                    {userData?.fullname?.lastname?.[0]}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-white truncate">
                  {userData?.fullname?.firstname} {userData?.fullname?.lastname}
                </h1>
                {isTyping ? (
                  <p className="text-xs text-[#10B981] animate-pulse">escribiendo...</p>
                ) : (
                  <p className="text-xs text-white/60">
                    {userType === "user" ? "Conductor" : "Pasajero"}
                  </p>
                )}
              </div>
            </div>

            {/* New Message Indicator */}
            {hasNewMessage && (
              <Badge variant="primary" size="small" className="h-2 w-2 p-0 animate-pulse" />
            )}
          </div>
        </motion.div>

        {/* Messages Area - iOS Deluxe Style */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-6" 
          ref={scrollableDivRef}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex flex-col justify-end min-h-full max-w-3xl mx-auto">
            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 rounded-full bg-[#10B981]/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={28} className="text-[#10B981]/70" />
                </div>
                <p className="text-sm text-white/60">
                  Inicia la conversación
                </p>
              </motion.div>
            )}
            
            {messages.length > 0 &&
              messages.map((message, i) => {
                if (!message || typeof message.msg !== 'string') {
                  Console.log('Invalid message in render:', message);
                  return null;
                }
                
                const isMyMessage = message.by === userType;
                return (
                  <motion.div
                    key={`${message.time}-${i}`}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className={`flex ${isMyMessage ? "justify-end" : "justify-start"} mb-3`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                        isMyMessage
                          ? "rounded-tr-sm bg-[#10B981] text-white shadow-lg"
                          : "rounded-tl-sm bg-white/10 backdrop-blur-md border border-white/10 text-white shadow-md"
                      }`}
                    >
                      <p className="text-sm break-words">{message.msg}</p>
                      <div className="flex items-center gap-1 justify-end mt-1.5">
                        <span className={`text-[10px] ${isMyMessage ? 'text-white/70' : 'text-white/50'}`}>
                          {message.time || ''}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            
            {/* Typing Indicator - iOS Deluxe Style */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.9 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="flex justify-start mb-3"
                >
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3 shadow-md">
                    <div className="flex gap-1.5">
                      <motion.span 
                        className="w-2 h-2 rounded-full bg-white/50"
                        animate={{ scale: [0.5, 1.2, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0 }}
                      />
                      <motion.span 
                        className="w-2 h-2 rounded-full bg-white/50"
                        animate={{ scale: [0.5, 1.2, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                      />
                      <motion.span 
                        className="w-2 h-2 rounded-full bg-white/50"
                        animate={{ scale: [0.5, 1.2, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input Area - iOS Deluxe Style */}
        <div className="border-t border-white/10 backdrop-blur-md px-4 py-4">
          <div className="flex items-end gap-3 max-w-3xl mx-auto">
            {/* Input Container with iOS Deluxe styling */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                placeholder="Escribe un mensaje..."
                className="w-full h-12 pl-4 pr-12 bg-white/10 backdrop-blur-md border border-white/20 focus:border-white/30 rounded-xl outline-none text-sm text-white placeholder:text-white/50 transition-colors"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    sendMessage(e);
                  }
                }}
                autoFocus
                spellCheck="false"
              />
            </div>

            {/* Send Button - iOS Deluxe Style */}
            <Button
              variant={message.trim() ? "primary" : "glass"}
              size="icon"
              icon={<Send size={16} />}
              onClick={sendMessage}
              disabled={!message.trim()}
              className="flex-shrink-0"
              aria-label="Enviar mensaje"
            />
          </div>
        </div>
      </div>
    );
  } else {
    return <Loading />;
  }
}

export default ChatScreen;
