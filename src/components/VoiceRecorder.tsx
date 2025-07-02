
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw } from 'lucide-react';
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
        // Simular transcrição (em um app real, você usaria um serviço de transcrição)
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
    // Simula o processo de transcrição
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Gravador de Voz</h1>
          <p className="text-slate-600">Grave e transcreva áudio com facilidade</p>
        </div>

        {/* Main Recording Interface */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="p-12">
            {/* Central Microphone */}
            <div className="flex flex-col items-center mb-8">
              <div className={`relative mb-6 ${isRecording && !isPaused ? 'animate-pulse' : ''}`}>
                <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording 
                    ? isPaused 
                      ? 'bg-yellow-100 border-4 border-yellow-400' 
                      : 'bg-red-100 border-4 border-red-400'
                    : 'bg-blue-100 border-4 border-blue-400 hover:bg-blue-200'
                }`}>
                  <Mic className={`w-12 h-12 ${
                    isRecording 
                      ? isPaused 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                      : 'text-blue-600'
                  }`} />
                </div>
                
                {/* Recording indicator rings */}
                {isRecording && !isPaused && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-20"></div>
                    <div className="absolute inset-4 rounded-full border-2 border-red-400 animate-ping opacity-40 animation-delay-200"></div>
                  </>
                )}
              </div>

              {/* Timer */}
              <div className="text-3xl font-mono font-bold text-slate-700 mb-2">
                {formatTime(recordingTime)}
              </div>
              
              {/* Status */}
              <div className="text-lg text-slate-500">
                {isRecording 
                  ? isPaused 
                    ? 'Gravação pausada' 
                    : 'Gravando...'
                  : 'Pronto para gravar'
                }
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center space-x-4">
              {!isRecording ? (
                <Button 
                  onClick={startRecording}
                  size="lg"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Iniciar Gravação
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={pauseRecording}
                    size="lg"
                    variant="outline"
                    className="px-6 py-3 rounded-full shadow-lg border-2 hover:shadow-xl transition-all duration-200"
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Retomar
                      </>
                    ) : (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pausar
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={stopRecording}
                    size="lg"
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Finalizar
                  </Button>
                </>
              )}
              
              {(recordingTime > 0 || transcription) && !isRecording && (
                <Button 
                  onClick={resetRecording}
                  size="lg"
                  variant="outline"
                  className="px-6 py-3 rounded-full shadow-lg border-2 hover:shadow-xl transition-all duration-200"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Resetar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transcription Area */}
        {transcription && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Transcrição</h3>
              <div className="bg-slate-50 rounded-lg p-4 min-h-[120px]">
                <p className="text-slate-700 leading-relaxed">
                  {transcription}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
