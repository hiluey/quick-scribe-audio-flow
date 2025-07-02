import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Volume2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface VoiceRecorderProps {}

const VoiceRecorder: React.FC<VoiceRecorderProps> = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        simulateTranscription();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      startTimer();
      
      toast({
        title: "Gravação iniciada",
        description: "Começando a gravar áudio...",
      });
    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar o microfone. Verifique as permissões.",
        variant: "destructive",
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        startTimer();
        setIsPaused(false);
        toast({
          title: "Gravação retomada",
          description: "Continuando a gravação...",
        });
      } else {
        mediaRecorderRef.current.pause();
        stopTimer();
        setIsPaused(true);
        toast({
          title: "Gravação pausada",
          description: "Gravação pausada temporariamente.",
        });
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      stopTimer();
      setIsRecording(false);
      setIsPaused(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      toast({
        title: "Gravação finalizada",
        description: "Processando transcrição...",
      });
    }
  };

  const resetRecording = () => {
    setRecordingTime(0);
    setTranscription('');
    setAudioBlob(null);
    setIsRecording(false);
    setIsPaused(false);
    stopTimer();
  };

  const simulateTranscription = () => {
    setTimeout(() => {
      const sampleTranscriptions = [
        "Esta é uma transcrição de exemplo do seu áudio gravado. Em um aplicativo real, isso seria processado por um serviço de transcrição como Google Speech-to-Text ou Azure Speech Services.",
        "Olá, esta é uma demonstração do recurso de transcrição de voz. O áudio foi gravado com sucesso e está sendo processado para texto.",
        "Transcrição concluída! Este texto representa o que foi falado durante a gravação. A qualidade da transcrição depende da clareza do áudio e da qualidade do microfone."
      ];
      
      const randomTranscription = sampleTranscriptions[Math.floor(Math.random() * sampleTranscriptions.length)];
      setTranscription(randomTranscription);
      
      toast({
        title: "Transcrição concluída",
        description: "O áudio foi transcrito com sucesso!",
      });
    }, 2000);
  };

  const downloadAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gravacao-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header com melhor tipografia */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Volume2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              VoiceFlow
            </h1>
          </div>
          <p className="text-xl text-slate-600 font-medium">Grave, transcreva e transforme sua voz em texto</p>
        </div>

        {/* Interface principal com melhor design */}
        <Card className="mb-8 bg-white/70 backdrop-blur-xl shadow-2xl border-0 ring-1 ring-white/20">
          <CardContent className="p-16">
            {/* Microfone central com animações melhoradas */}
            <div className="flex flex-col items-center mb-12">
              <div className="relative mb-8">
                {/* Círculos de animação */}
                {isRecording && !isPaused && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-400 to-pink-400 animate-ping opacity-20 scale-110"></div>
                    <div className="absolute inset-2 rounded-full bg-gradient-to-r from-red-400 to-pink-400 animate-ping opacity-30 scale-105 animation-delay-200"></div>
                    <div className="absolute inset-4 rounded-full bg-gradient-to-r from-red-400 to-pink-400 animate-ping opacity-40 scale-100 animation-delay-400"></div>
                  </>
                )}
                
                {/* Botão principal do microfone */}
                <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl cursor-pointer ${
                  isRecording 
                    ? isPaused 
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 scale-105' 
                      : 'bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 scale-110'
                    : 'bg-gradient-to-br from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 hover:scale-105'
                }`} onClick={!isRecording ? startRecording : undefined}>
                  <Mic className={`w-16 h-16 text-white drop-shadow-lg ${
                    isRecording && !isPaused ? 'animate-pulse' : ''
                  }`} />
                </div>
              </div>

              {/* Timer com design melhorado */}
              <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl px-8 py-4 mb-3 shadow-xl">
                <div className="text-4xl font-mono font-black text-white tracking-wider">
                  {formatTime(recordingTime)}
                </div>
              </div>
              
              {/* Status com badge */}
              <div className={`px-6 py-2 rounded-full text-sm font-semibold shadow-lg ${
                isRecording 
                  ? isPaused 
                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                    : 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {isRecording 
                  ? isPaused 
                    ? '⏸️ Gravação pausada' 
                    : '🔴 Gravando áudio...'
                  : '🎙️ Pronto para gravar'
                }
              </div>
            </div>

            {/* Botões de controle melhorados */}
            <div className="flex justify-center items-center gap-4 flex-wrap">
              {!isRecording ? (
                <Button 
                  onClick={startRecording}
                  size="lg"
                  className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 text-lg font-semibold"
                >
                  <Mic className="w-6 h-6 mr-3" />
                  Iniciar Gravação
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={pauseRecording}
                    size="lg"
                    variant="outline"
                    className="px-8 py-4 rounded-2xl shadow-xl border-2 hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg font-semibold bg-white/80 backdrop-blur-sm"
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-6 h-6 mr-3" />
                        Retomar
                      </>
                    ) : (
                      <>
                        <Pause className="w-6 h-6 mr-3" />
                        Pausar
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={stopRecording}
                    size="lg"
                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-8 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 text-lg font-semibold"
                  >
                    <Square className="w-6 h-6 mr-3" />
                    Finalizar
                  </Button>
                </>
              )}
              
              {(recordingTime > 0 || transcription || audioBlob) && !isRecording && (
                <>
                  <Button 
                    onClick={resetRecording}
                    size="lg"
                    variant="outline"
                    className="px-8 py-4 rounded-2xl shadow-xl border-2 hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg font-semibold bg-white/80 backdrop-blur-sm"
                  >
                    <RotateCcw className="w-6 h-6 mr-3" />
                    Resetar
                  </Button>
                  
                  {audioBlob && (
                    <Button 
                      onClick={downloadAudio}
                      size="lg"
                      variant="outline"
                      className="px-8 py-4 rounded-2xl shadow-xl border-2 hover:shadow-2xl transition-all duration-300 hover:scale-105 text-lg font-semibold bg-white/80 backdrop-blur-sm"
                    >
                      <Download className="w-6 h-6 mr-3" />
                      Download
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Área de transcrição melhorada */}
        {transcription && (
          <Card className="bg-white/70 backdrop-blur-xl shadow-2xl border-0 ring-1 ring-white/20">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">T</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Transcrição</h3>
              </div>
              
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-8 min-h-[160px] shadow-inner border border-slate-200/50">
                <p className="text-slate-700 leading-relaxed text-lg">
                  {transcription}
                </p>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={() => navigator.clipboard.writeText(transcription)}
                  variant="outline"
                  className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  📋 Copiar Texto
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
