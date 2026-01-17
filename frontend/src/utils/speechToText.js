/**
 * Browser-based Speech-to-Text for YouTube Videos
 * Uses Web Speech API as ultimate fallback when captions aren't available
 */

/**
 * Extract audio from YouTube video and transcribe using browser's speech recognition
 * @param {string} videoId - YouTube video ID
 * @param {function} onProgress - Callback for progress updates (0-100)
 * @returns {Promise<string>} - Transcribed text
 */
export const transcribeYouTubeVideo = async (videoId, onProgress) => {
  return new Promise((resolve, reject) => {
    try {
      // Check if browser supports Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        throw new Error('Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.');
      }

      console.log('🎤 Starting browser-based speech-to-text transcription...');

      // Initialize speech recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      let transcript = '';
      let isTranscribing = true;

      // Get the YouTube player iframe
      const iframe = document.querySelector('iframe[src*="youtube.com/embed"]');
      
      if (!iframe) {
        throw new Error('YouTube player not found. Please make sure the video is loaded.');
      }

      console.log('✅ Found YouTube player, starting transcription...');
      if (onProgress) onProgress(10);

      // Start recognition
      recognition.start();

      recognition.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            transcript += transcriptPiece + ' ';
            console.log('📝 Transcribed:', transcriptPiece);
            
            // Update progress based on transcript length (rough estimate)
            const progress = Math.min(90, 10 + (transcript.length / 50));
            if (onProgress) onProgress(progress);
          } else {
            interimTranscript += transcriptPiece;
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
        
        if (event.error === 'no-speech') {
          console.log('⚠️ No speech detected, waiting...');
        } else if (event.error === 'aborted') {
          console.log('⚠️ Recognition aborted');
        } else {
          reject(new Error(`Speech recognition error: ${event.error}`));
        }
      };

      recognition.onend = () => {
        console.log('🏁 Speech recognition ended');
        
        if (isTranscribing && transcript.length < 100) {
          console.log('⚠️ Transcript too short, restarting...');
          recognition.start();
        } else {
          if (onProgress) onProgress(100);
          resolve(transcript.trim());
        }
      };

      // Auto-stop after reasonable time (most videos are < 20 minutes)
      const maxDuration = 20 * 60 * 1000; // 20 minutes
      setTimeout(() => {
        isTranscribing = false;
        recognition.stop();
        
        if (transcript.length < 100) {
          reject(new Error('Transcription timeout - insufficient audio captured'));
        }
      }, maxDuration);

      // Stop transcription when user closes modal or navigates away
      window.addEventListener('beforeunload', () => {
        recognition.stop();
      });

    } catch (error) {
      console.error('❌ Browser transcription failed:', error);
      reject(error);
    }
  });
};

/**
 * Simplified version: Ask user to play the video while we transcribe
 * This is more reliable than trying to capture iframe audio
 */
export const transcribeWithUserHelp = async (onProgress, onStatusChange) => {
  return new Promise((resolve, reject) => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        reject(new Error('Speech recognition not supported. Please use Chrome, Edge, or Safari.'));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      let transcript = '';
      let silenceTimer = null;
      const SILENCE_TIMEOUT = 5000; // Stop after 5 seconds of silence

      if (onStatusChange) {
        onStatusChange('🎤 Speech recognition ready! Please play the video now...');
      }

      recognition.start();
      console.log('🎤 Speech recognition started - waiting for audio...');

      recognition.onresult = (event) => {
        // Clear silence timer since we're getting audio
        if (silenceTimer) {
          clearTimeout(silenceTimer);
        }

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            transcript += transcriptPiece + ' ';
            console.log('📝', transcriptPiece);
            
            if (onStatusChange) {
              onStatusChange(`📝 Transcribing... (${transcript.length} characters)`);
            }
            
            const progress = Math.min(90, (transcript.length / 50));
            if (onProgress) onProgress(progress);
          }
        }

        // Reset silence timer
        silenceTimer = setTimeout(() => {
          console.log('⏸️ Silence detected, stopping transcription...');
          recognition.stop();
        }, SILENCE_TIMEOUT);
      };

      recognition.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
        
        if (event.error === 'no-speech') {
          if (onStatusChange) {
            onStatusChange('⚠️ No audio detected. Make sure video is playing with sound!');
          }
        } else if (event.error !== 'aborted') {
          reject(new Error(`Speech recognition error: ${event.error}`));
        }
      };

      recognition.onend = () => {
        if (silenceTimer) {
          clearTimeout(silenceTimer);
        }

        if (transcript.length < 50) {
          reject(new Error('Transcription too short. Please ensure video audio is audible.'));
        } else {
          if (onProgress) onProgress(100);
          if (onStatusChange) {
            onStatusChange(`✅ Transcription complete! (${transcript.length} characters)`);
          }
          resolve(transcript.trim());
        }
      };

      // Manual stop function (can be called from UI)
      window.stopTranscription = () => {
        recognition.stop();
      };

    } catch (error) {
      console.error('❌ Browser transcription initialization failed:', error);
      reject(error);
    }
  });
};
