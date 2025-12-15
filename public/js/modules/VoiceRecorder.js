/**
 * VoiceRecorder - ES6 Class untuk fitur Voice-to-Text
 * Menggunakan Web Speech API native (SpeechRecognition)
 * 
 * @author Senior Frontend Developer - Pulih Project
 * @version 1.0.0
 */

export class VoiceRecorder {
    /**
     * Konstruktor untuk VoiceRecorder
     * @param {string} micButtonSelector - Selector ID tombol mic (contoh: '#btn-mic')
     * @param {string} inputFieldSelector - Selector ID input field (contoh: '#chat-input')
     * @param {Object} options - Opsi tambahan
     * @param {string} options.lang - Bahasa untuk recognition (default: 'id-ID')
     * @param {boolean} options.continuous - Mode continuous recording (default: false)
     * @param {boolean} options.interimResults - Tampilkan hasil sementara (default: true)
     */
    constructor(micButtonSelector, inputFieldSelector, options = {}) {
        // Simpan referensi elemen
        this.micButton = document.querySelector(micButtonSelector);
        this.inputField = document.querySelector(inputFieldSelector);

        // Validasi elemen
        if (!this.micButton) {
            console.error(`[VoiceRecorder] Tombol mic tidak ditemukan: ${micButtonSelector}`);
            return;
        }
        if (!this.inputField) {
            console.error(`[VoiceRecorder] Input field tidak ditemukan: ${inputFieldSelector}`);
            return;
        }

        // Opsi konfigurasi
        this.options = {
            lang: options.lang || 'id-ID',
            continuous: options.continuous ?? false,
            interimResults: options.interimResults ?? true
        };

        // State
        this.isRecording = false;
        this.recognition = null;
        this.originalValue = ''; // Menyimpan teks sebelum recording untuk interim display
        this.finalTranscript = ''; // Akumulasi final transcript

        // Inisialisasi
        this._init();
    }

    /**
     * Inisialisasi Web Speech API dan event listeners
     * @private
     */
    _init() {
        // Cek dukungan browser
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('[VoiceRecorder] Browser tidak mendukung Web Speech API. Fitur voice-to-text dinonaktifkan.');
            this._showUnsupportedWarning();
            return;
        }

        // Buat instance SpeechRecognition
        this.recognition = new SpeechRecognition();

        // Konfigurasi recognition
        this.recognition.lang = this.options.lang;
        this.recognition.continuous = this.options.continuous;
        this.recognition.interimResults = this.options.interimResults;
        this.recognition.maxAlternatives = 1;

        // Bind event handlers
        this._bindRecognitionEvents();
        this._bindButtonEvents();

        console.log('[VoiceRecorder] Inisialisasi berhasil. Bahasa:', this.options.lang);
    }

    /**
     * Bind event listeners untuk SpeechRecognition
     * @private
     */
    _bindRecognitionEvents() {
        // Event: Hasil recognition
        this.recognition.onresult = (event) => {
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    // Akumulasi final transcript
                    this.finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            // Update input field dengan hasil (real-time)
            // Tampilkan: original value + final accumulated + interim sementara
            const separator = this.originalValue ? ' ' : '';
            const displayText = this.originalValue + separator + this.finalTranscript + interimTranscript;

            this.inputField.value = displayText.trim();

            // Trigger input event untuk auto-resize textarea jika ada
            this.inputField.dispatchEvent(new Event('input', { bubbles: true }));

            console.log('[VoiceRecorder] Realtime:', interimTranscript || this.finalTranscript);
        };

        // Event: Recognition dimulai
        this.recognition.onstart = () => {
            this.isRecording = true;
            this.micButton.classList.add('is-recording');
            // Simpan teks yang sudah ada sebelum recording
            this.originalValue = this.inputField.value;
            this.finalTranscript = '';
            console.log('[VoiceRecorder] Mulai merekam...');
        };

        // Event: Recognition berhenti
        this.recognition.onend = () => {
            this.isRecording = false;
            this.micButton.classList.remove('is-recording');
            console.log('[VoiceRecorder] Berhenti merekam.');
        };

        // Event: Error
        this.recognition.onerror = (event) => {
            this.isRecording = false;
            this.micButton.classList.remove('is-recording');

            switch (event.error) {
                case 'not-allowed':
                    console.warn('[VoiceRecorder] Akses mikrofon ditolak. Mohon izinkan akses mikrofon di browser Anda.');
                    this._showError('Akses mikrofon ditolak. Mohon izinkan akses mikrofon di pengaturan browser Anda.');
                    break;
                case 'no-speech':
                    console.warn('[VoiceRecorder] Tidak ada suara terdeteksi.');
                    break;
                case 'audio-capture':
                    console.warn('[VoiceRecorder] Mikrofon tidak ditemukan.');
                    this._showError('Mikrofon tidak ditemukan. Pastikan perangkat Anda memiliki mikrofon.');
                    break;
                case 'network':
                    console.warn('[VoiceRecorder] Kesalahan jaringan saat speech recognition.');
                    this._showError('Terjadi kesalahan jaringan. Periksa koneksi internet Anda.');
                    break;
                case 'aborted':
                    console.log('[VoiceRecorder] Recognition dibatalkan.');
                    break;
                default:
                    console.warn('[VoiceRecorder] Error:', event.error);
            }
        };

        // Event: Tidak ada suara terdeteksi (auto-stop)
        this.recognition.onspeechend = () => {
            // Recognition akan otomatis berhenti setelah periode diam
            // Ini normal jika continuous = false
        };
    }

    /**
     * Bind event listeners untuk tombol mic
     * @private
     */
    _bindButtonEvents() {
        this.micButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle();
        });
    }

    /**
     * Toggle recording: mulai jika idle, stop jika sedang merekam
     */
    toggle() {
        if (this.isRecording) {
            this.stop();
        } else {
            this.start();
        }
    }

    /**
     * Mulai merekam
     */
    start() {
        if (!this.recognition) {
            console.warn('[VoiceRecorder] Speech Recognition tidak tersedia.');
            return;
        }

        if (this.isRecording) {
            console.warn('[VoiceRecorder] Sudah dalam mode recording.');
            return;
        }

        try {
            this.recognition.start();
        } catch (error) {
            console.warn('[VoiceRecorder] Gagal memulai recording:', error);
        }
    }

    /**
     * Stop merekam
     */
    stop() {
        if (!this.recognition) {
            return;
        }

        if (!this.isRecording) {
            console.warn('[VoiceRecorder] Tidak dalam mode recording.');
            return;
        }

        try {
            this.recognition.stop();
        } catch (error) {
            console.warn('[VoiceRecorder] Gagal menghentikan recording:', error);
        }
    }

    /**
     * Tampilkan peringatan browser tidak support
     * @private
     */
    _showUnsupportedWarning() {
        // Disable tombol mic dan beri visual feedback
        this.micButton.disabled = true;
        this.micButton.style.opacity = '0.5';
        this.micButton.style.cursor = 'not-allowed';
        this.micButton.title = 'Browser tidak mendukung Voice-to-Text';
    }

    /**
     * Tampilkan error ke user (toast/alert halus)
     * @param {string} message - Pesan error
     * @private
     */
    _showError(message) {
        // Cek jika ada fungsi toast global, gunakan itu
        if (typeof window.showToast === 'function') {
            window.showToast(message, 'warning');
        } else if (typeof window.showTemporaryMessage === 'function') {
            window.showTemporaryMessage(message);
        } else {
            // Fallback: alert halus dengan setTimeout
            console.warn('[VoiceRecorder]', message);

            // Buat toast sederhana jika belum ada
            this._createSimpleToast(message);
        }
    }

    /**
     * Buat toast sederhana untuk error
     * @param {string} message - Pesan error
     * @private
     */
    _createSimpleToast(message) {
        // Cek jika toast sudah ada, hapus dulu
        const existingToast = document.getElementById('voice-recorder-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Buat elemen toast
        const toast = document.createElement('div');
        toast.id = 'voice-recorder-toast';
        toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-red-500 text-white text-sm rounded-xl shadow-lg flex items-center gap-2 animate-[fadeIn_0.3s_ease-out]';
        toast.innerHTML = `
            <span class="material-symbols-outlined text-sm">warning</span>
            <span>${message}</span>
        `;

        document.body.appendChild(toast);

        // Auto-remove setelah 5 detik
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, 20px)';
            toast.style.transition = 'all 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    /**
     * Destroy instance dan bersihkan event listeners
     */
    destroy() {
        if (this.recognition) {
            this.recognition.abort();
            this.recognition = null;
        }
        this.isRecording = false;
        this.micButton.classList.remove('is-recording');
        console.log('[VoiceRecorder] Instance destroyed.');
    }
}

// Default export
export default VoiceRecorder;
