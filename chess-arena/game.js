
(function() {
    'use strict';

    // ========================================
    // Configuration & Constants
    // ========================================
    const PIECES = {
        'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
        'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
    };

    const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

    // ========================================
    // Game State
    // ========================================
    let socket = null;
    let chess = null;
    let gameState = {
        roomId: null,
        playerColor: null,
        username: null,
        opponent: null,
        timeControl: null,
        isMyTurn: false,
        gameStarted: false,
        gameOver: false,
        selectedSquare: null,
        legalMoves: [],
        lastMove: null,
        isFlipped: false,
        soundEnabled: true,
        pendingPromotion: null
    };

    let timers = {
        white: null,
        black: null,
        interval: null
    };

    let unreadMessages = 0;

    // ========================================
    // Audio
    // ========================================
    const sounds = {
        move: null,
        capture: null,
        check: null,
        castle: null,
        promote: null,
        gameStart: null,
        gameEnd: null,
        notify: null
    };

    function initSounds() {
        // Create audio context for generating sounds
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const audioCtx = new AudioContext();

        function createSound(frequency, duration, type = 'sine') {
            return function() {
                if (!gameState.soundEnabled) return;
                
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = type;
                
                gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
                
                oscillator.start(audioCtx.currentTime);
                oscillator.stop(audioCtx.currentTime + duration);
            };
        }

        sounds.move = createSound(400, 0.1);
        sounds.capture = createSound(300, 0.15);
        sounds.check = createSound(600, 0.2);
        sounds.castle = createSound(350, 0.15);
        sounds.promote = createSound(800, 0.2);
        sounds.gameStart = createSound(500, 0.3);
        sounds.gameEnd = createSound(200, 0.5);
        sounds.notify = createSound(700, 0.1);
    }

    // ========================================
    // DOM Elements
    // ========================================
    const elements = {};

    function cacheElements() {
        elements.loadingScreen = document.getElementById('loading-screen');
        elements.app = document.getElementById('app');
        elements.lobbyScreen = document.getElementById('lobby-screen');
        elements.waitingScreen = document.getElementById('waiting-screen');
        elements.gameScreen = document.getElementById('game-screen');
        
        elements.usernameInput = document.getElementById('username-input');
        elements.roomCodeInput = document.getElementById('room-code-input');
        elements.createGameBtn = document.getElementById('create-game-btn');
        elements.joinGameBtn = document.getElementById('join-game-btn');
        elements.timeBtns = document.querySelectorAll('.time-btn');
        elements.roomsList = document.getElementById('rooms-list');
        elements.refreshRoomsBtn = document.getElementById('refresh-rooms');
        
        elements.displayRoomCode = document.getElementById('display-room-code');
        elements.waitingTimeControl = document.getElementById('waiting-time-control');
        elements.copyCodeBtn = document.getElementById('copy-code-btn');
        elements.cancelWaitingBtn = document.getElementById('cancel-waiting');
        
        elements.chessboard = document.getElementById('chessboard');
        elements.opponentName = document.getElementById('opponent-name');
        elements.opponentColor = document.getElementById('opponent-color');
        elements.opponentTime = document.getElementById('opponent-time');
        elements.opponentTimer = document.getElementById('opponent-timer');
        elements.playerName = document.getElementById('player-name');
        elements.playerColor = document.getElementById('player-color');
        elements.playerTime = document.getElementById('player-time');
        elements.playerTimer = document.getElementById('player-timer');
        elements.opponentCaptured = document.getElementById('opponent-captured');
        elements.playerCaptured = document.getElementById('player-captured');
        elements.moveHistory = document.getElementById('move-history');
        
        elements.resignBtn = document.getElementById('resign-btn');
        elements.drawBtn = document.getElementById('draw-btn');
        elements.flipBoardBtn = document.getElementById('flip-board-btn');
        elements.chatToggleBtn = document.getElementById('chat-toggle-btn');
        elements.chatBadge = document.getElementById('chat-badge');
        elements.chatPanel = document.getElementById('chat-panel');
        elements.chatMessages = document.getElementById('chat-messages');
        elements.chatInput = document.getElementById('chat-input');
        elements.sendChatBtn = document.getElementById('send-chat-btn');
        
        elements.themeToggle = document.getElementById('theme-toggle');
        elements.themeDropdown = document.getElementById('theme-dropdown');
        elements.soundToggle = document.getElementById('sound-toggle');
        
        elements.gameOverModal = document.getElementById('game-over-modal');
        elements.gameOverIcon = document.getElementById('game-over-icon');
        elements.gameOverTitle = document.getElementById('game-over-title');
        elements.gameOverMessage = document.getElementById('game-over-message');
        elements.playAgainBtn = document.getElementById('play-again-btn');
        elements.backToLobbyBtn = document.getElementById('back-to-lobby-btn');
        
        elements.drawOfferModal = document.getElementById('draw-offer-modal');
        elements.drawOfferMessage = document.getElementById('draw-offer-message');
        elements.acceptDrawBtn = document.getElementById('accept-draw-btn');
        elements.declineDrawBtn = document.getElementById('decline-draw-btn');
        
        elements.resignModal = document.getElementById('resign-modal');
        elements.confirmResignBtn = document.getElementById('confirm-resign-btn');
        elements.cancelResignBtn = document.getElementById('cancel-resign-btn');
        
        elements.promotionModal = document.getElementById('promotion-modal');
        elements.promotionPieces = document.getElementById('promotion-pieces');
        
        elements.disconnectModal = document.getElementById('disconnect-modal');
        elements.disconnectMessage = document.getElementById('disconnect-message');
        elements.disconnectCountdown = document.getElementById('disconnect-countdown');
        
        elements.toastContainer = document.getElementById('toast-container');
    }

    // ========================================
    // Utilities
    // ========================================
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
        `;
        
        elements.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    function formatTime(seconds) {
        if (seconds === null || seconds === undefined) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
    }

    function showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    function hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    function hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    // ========================================
    // Theme Management
    // ========================================
    function initTheme() {
        const savedTheme = localStorage.getItem('chess-theme') || 'dark';
        setTheme(savedTheme);
    }

    function setTheme(themeName) {
        document.body.className = '';
        document.body.classList.add(`theme-${themeName}`);
        localStorage.setItem('chess-theme', themeName);
        
        // Update active state in dropdown
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.theme === themeName) {
                option.classList.add('active');
            }
        });
    }

    // ========================================
    // Socket Connection
    // ========================================
    function initSocket() {
        socket = io({
            transports: ['websocket', 'polling'],
            upgrade: true
        });

        socket.on('connect', () => {
            console.log('Connected to server');
            showToast('Connected to server', 'success');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
            showToast('Disconnected from server', 'error');
        });

        socket.on('error', (data) => {
            showToast(data.message, 'error');
        });

        socket.on('room_created', handleRoomCreated);
        socket.on('room_joined', handleRoomJoined);
        socket.on('game_restored', handleGameRestored);
        socket.on('opponent_joined', handleOpponentJoined);
        socket.on('opponent_reconnected', handleOpponentReconnected);
        socket.on('game_start', handleGameStart);
        socket.on('move_made', handleMoveMade);
        socket.on('game_over', handleGameOver);
        socket.on('opponent_disconnected', handleOpponentDisconnected);
        socket.on('draw_offered', handleDrawOffered);
        socket.on('draw_declined', handleDrawDeclined);
        socket.on('chat_message', handleChatMessage);
        socket.on('rooms_list', handleRoomsList);
    }

    // ========================================
    // Socket Event Handlers
    // ========================================
    function handleRoomCreated(data) {
        gameState.roomId = data.room_id;
        gameState.playerColor = data.color;
        gameState.timeControl = data.time_control;
        
        elements.displayRoomCode.textContent = data.room_id;
        elements.waitingTimeControl.textContent = data.time_control 
            ? `${data.time_control} minutes` 
            : 'No Limit';
        
        showScreen('waiting-screen');
        showToast('Room created! Share the code with your friend.', 'success');
    }

    function handleRoomJoined(data) {
        gameState.roomId = data.room_id;
        gameState.playerColor = data.color;
        gameState.timeControl = data.time_control;
        gameState.opponent = data.opponent;
        
        showToast(`Joined room! Playing against ${data.opponent}`, 'success');
    }

    function handleGameRestored(data) {
        gameState.roomId = data.room_id;
        gameState.playerColor = data.color;
        gameState.opponent = data.opponent;
        
        // Restore game state
        chess = new Chess(data.game_state.fen);
        timers.white = data.white_time;
        timers.black = data.black_time;
        
        initGameScreen();
        renderBoard();
        updateTimers();
        
        showToast('Game restored!', 'success');
    }

    function handleOpponentJoined(data) {
        gameState.opponent = data.username;
        showToast(`${data.username} joined the game!`, 'success');
    }

    function handleOpponentReconnected(data) {
        hideModal('disconnect-modal');
        gameState.opponent = data.username;
        
        // Restore game state
        chess = new Chess(data.game_state.fen);
        timers.white = data.white_time;
        timers.black = data.black_time;
        
        renderBoard();
        updateTimers();
        startTimer();
        
        showToast(`${data.username} reconnected!`, 'success');
    }

    function handleGameStart(data) {
        gameState.gameStarted = true;
        gameState.opponent = gameState.playerColor === 'white' ? data.black : data.white;
        gameState.timeControl = data.time_control;
        
        // Initialize chess.js
        chess = new Chess();
        
        if (data.game_state && data.game_state.fen) {
            chess = new Chess(data.game_state.fen);
        }
        
        // Initialize timers
        if (gameState.timeControl) {
            timers.white = gameState.timeControl * 60;
            timers.black = gameState.timeControl * 60;
        }
        
        initGameScreen();
        renderBoard();
        updateTimers();
        startTimer();
        
        if (sounds.gameStart) sounds.gameStart();
        showToast('Game started! Good luck!', 'success');
    }

    function handleMoveMade(data) {
        // Update chess.js state
        chess = new Chess(data.fen);
        
        // Store last move for highlighting
        gameState.lastMove = data.move;
        
        // Update timers
        if (gameState.timeControl) {
            timers.white = data.white_time;
            timers.black = data.black_time;
        }
        
        // Clear selection
        gameState.selectedSquare = null;
        gameState.legalMoves = [];
        
        // Play appropriate sound
        if (data.is_checkmate && sounds.gameEnd) {
            sounds.gameEnd();
        } else if (data.is_check && sounds.check) {
            sounds.check();
        } else if (data.move.includes('x') && sounds.capture) {
            sounds.capture();
        } else if ((data.move === 'O-O' || data.move === 'O-O-O') && sounds.castle) {
            sounds.castle();
        } else if (sounds.move) {
            sounds.move();
        }
        
        // Update display
        renderBoard();
        updateTimers();
        updateMoveHistory();
        updateCapturedPieces();
        
        // Check game end conditions
        if (data.is_checkmate || data.is_draw || data.is_stalemate) {
            handleGameEnd(data);
        }
    }

    function handleGameOver(data) {
        gameState.gameOver = true;
        stopTimer();
        
        const isWinner = data.winner === gameState.username;
        const isDraw = !data.winner;
        
        elements.gameOverIcon.className = 'game-over-icon';
        
        if (isDraw) {
            elements.gameOverIcon.classList.add('draw');
            elements.gameOverIcon.innerHTML = '<i class="fas fa-handshake"></i>';
            elements.gameOverTitle.textContent = 'Draw!';
            elements.gameOverMessage.textContent = getDrawMessage(data.reason);
        } else if (isWinner) {
            elements.gameOverIcon.innerHTML = '<i class="fas fa-trophy"></i>';
            elements.gameOverTitle.textContent = 'Victory!';
            elements.gameOverMessage.textContent = getWinMessage(data.reason);
        } else {
            elements.gameOverIcon.classList.add('loss');
            elements.gameOverIcon.innerHTML = '<i class="fas fa-times"></i>';
            elements.gameOverTitle.textContent = 'Defeat';
            elements.gameOverMessage.textContent = getLossMessage(data.reason, data);
        }
        
        if (sounds.gameEnd) sounds.gameEnd();
        showModal('game-over-modal');
    }

    function getDrawMessage(reason) {
        switch (reason) {
            case 'stalemate': return 'Stalemate - No legal moves available.';
            case 'insufficient': return 'Insufficient material to checkmate.';
            case 'threefold': return 'Threefold repetition.';
            case 'fifty_moves': return 'Fifty-move rule.';
            case 'draw_agreement': return 'Draw by agreement.';
            default: return 'The game ended in a draw.';
        }
    }

    function getWinMessage(reason) {
        switch (reason) {
            case 'checkmate': return 'Checkmate! Excellent play!';
            case 'resignation': return 'Your opponent resigned.';
            case 'timeout': return 'Your opponent ran out of time.';
            case 'abandonment': return 'Your opponent abandoned the game.';
            default: return 'You won the game!';
        }
    }

    function getLossMessage(reason, data) {
        switch (reason) {
            case 'checkmate': return 'Checkmate! Better luck next time.';
            case 'resignation': return 'You resigned the game.';
            case 'timeout': return 'You ran out of time.';
            case 'abandonment': return 'Game forfeited due to disconnection.';
            default: return 'You lost the game.';
        }
    }

    function handleGameEnd(data) {
        gameState.gameOver = true;
        stopTimer();
        
        if (data.is_checkmate) {
            const winner = chess.turn() === 'w' ? 'Black' : 'White';
            const isWinner = (winner === 'White' && gameState.playerColor === 'white') ||
                            (winner === 'Black' && gameState.playerColor === 'black');
            
            elements.gameOverIcon.className = 'game-over-icon';
            
            if (isWinner) {
                elements.gameOverIcon.innerHTML = '<i class="fas fa-trophy"></i>';
                elements.gameOverTitle.textContent = 'Victory!';
                elements.gameOverMessage.textContent = 'Checkmate! Excellent play!';
            } else {
                elements.gameOverIcon.classList.add('loss');
                elements.gameOverIcon.innerHTML = '<i class="fas fa-times"></i>';
                elements.gameOverTitle.textContent = 'Defeat';
                elements.gameOverMessage.textContent = 'Checkmate! Better luck next time.';
            }
        } else if (data.is_stalemate) {
            elements.gameOverIcon.className = 'game-over-icon draw';
            elements.gameOverIcon.innerHTML = '<i class="fas fa-handshake"></i>';
            elements.gameOverTitle.textContent = 'Draw!';
            elements.gameOverMessage.textContent = 'Stalemate - No legal moves available.';
        } else if (data.is_draw) {
            elements.gameOverIcon.className = 'game-over-icon draw';
            elements.gameOverIcon.innerHTML = '<i class="fas fa-handshake"></i>';
            elements.gameOverTitle.textContent = 'Draw!';
            elements.gameOverMessage.textContent = 'The game ended in a draw.';
        }
        
        showModal('game-over-modal');
    }

    function handleOpponentDisconnected(data) {
        showModal('disconnect-modal');
        elements.disconnectMessage.textContent = `${data.username} disconnected. Waiting for reconnection...`;
        
        let countdown = data.timeout;
        stopTimer();
        
        const disconnectInterval = setInterval(() => {
            countdown--;
            elements.disconnectCountdown.textContent = formatTime(countdown);
            
            if (countdown <= 0) {
                clearInterval(disconnectInterval);
            }
        }, 1000);
        
        // Store interval for cleanup
        gameState.disconnectInterval = disconnectInterval;
    }

    function handleDrawOffered(data) {
        elements.drawOfferMessage.textContent = `${data.from} offers a draw`;
        showModal('draw-offer-modal');
        if (sounds.notify) sounds.notify();
    }

    function handleDrawDeclined(data) {
        showToast(`${data.by} declined the draw offer`, 'info');
    }

    function handleChatMessage(data) {
        addChatMessage(data.username, data.message, data.timestamp);
        
        if (data.username !== gameState.username) {
            unreadMessages++;
            updateChatBadge();
            if (sounds.notify) sounds.notify();
        }
    }

    function handleRoomsList(data) {
        renderRoomsList(data.rooms);
    }

    // ========================================
    // Game Screen Initialization
    // ========================================
    function initGameScreen() {
        showScreen('game-screen');
        
        // Set player info
        elements.playerName.textContent = gameState.username;
        elements.playerColor.textContent = capitalizeFirst(gameState.playerColor);
        elements.opponentName.textContent = gameState.opponent || 'Opponent';
        elements.opponentColor.textContent = gameState.playerColor === 'white' ? 'Black' : 'White';
        
        // Hide timers if no time control
        if (!gameState.timeControl) {
            elements.playerTimer.style.display = 'none';
            elements.opponentTimer.style.display = 'none';
        } else {
            elements.playerTimer.style.display = 'flex';
            elements.opponentTimer.style.display = 'flex';
        }
        
        // Flip board if playing black
        if (gameState.playerColor === 'black') {
            gameState.isFlipped = true;
        }
        
        // Reset game state
        gameState.gameOver = false;
        gameState.selectedSquare = null;
        gameState.legalMoves = [];
        gameState.lastMove = null;
        
        // Clear move history
        elements.moveHistory.innerHTML = '';
        
        // Clear captured pieces
        elements.opponentCaptured.innerHTML = '';
        elements.playerCaptured.innerHTML = '';
        
        // Clear chat
        elements.chatMessages.innerHTML = '';
        unreadMessages = 0;
        updateChatBadge();
    }

    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ========================================
    // Board Rendering
    // ========================================
    function renderBoard() {
        elements.chessboard.innerHTML = '';
        
        const files = gameState.isFlipped ? [...FILES].reverse() : FILES;
        const ranks = gameState.isFlipped ? [...RANKS].reverse() : RANKS;
        
        ranks.forEach((rank, rankIdx) => {
            files.forEach((file, fileIdx) => {
                const square = file + rank;
                const isLight = (rankIdx + fileIdx) % 2 === 0;
                
                const squareEl = document.createElement('div');
                squareEl.className = `board-square ${isLight ? 'light' : 'dark'}`;
                squareEl.dataset.square = square;
                
                // Add coordinates
                if (fileIdx === 7) {
                    const rankLabel = document.createElement('span');
                    rankLabel.className = 'coord-rank';
                    rankLabel.textContent = rank;
                    squareEl.appendChild(rankLabel);
                }
                if (rankIdx === 7) {
                    const fileLabel = document.createElement('span');
                    fileLabel.className = 'coord-file';
                    fileLabel.textContent = file;
                    squareEl.appendChild(fileLabel);
                }
                
                // Add piece
                const piece = chess.get(square);
                if (piece) {
                    const pieceEl = document.createElement('span');
                    pieceEl.className = `piece piece-${piece.color === 'w' ? 'white' : 'black'}`;
                    pieceEl.textContent = PIECES[piece.color === 'w' ? piece.type.toUpperCase() : piece.type];
                    squareEl.appendChild(pieceEl);
                }
                
                // Highlight selected square
                if (gameState.selectedSquare === square) {
                    squareEl.classList.add('selected');
                }
                
                // Highlight last move
                if (gameState.lastMove) {
                    const from = gameState.lastMove.from || extractFromMove(gameState.lastMove);
                    const to = gameState.lastMove.to || extractToMove(gameState.lastMove);
                    if (square === from || square === to) {
                        squareEl.classList.add('last-move');
                    }
                }
                
                // Highlight legal moves
                if (gameState.legalMoves.includes(square)) {
                    const targetPiece = chess.get(square);
                    if (targetPiece) {
                        squareEl.classList.add('legal-capture');
                    } else {
                        squareEl.classList.add('legal-move');
                    }
                }
                
                // Add check indicator
                if (chess.inCheck()) {
                    const kingSquare = findKingSquare(chess.turn());
                    if (square === kingSquare) {
                        const checkRing = document.createElement('div');
                        checkRing.className = 'check-ring';
                        squareEl.appendChild(checkRing);
                    }
                }
                
                // Add click handler
                squareEl.addEventListener('click', () => handleSquareClick(square));
                
                elements.chessboard.appendChild(squareEl);
            });
        });
        
        // Update turn indicator
        updateTurnIndicator();
    }

    function extractFromMove(moveStr) {
        // For SAN notation, try to find the from square
        // This is a simplified version
        return null;
    }

    function extractToMove(moveStr) {
        // For SAN notation, extract the target square
        if (typeof moveStr === 'string') {
            const match = moveStr.match(/[a-h][1-8]/g);
            if (match) {
                return match[match.length - 1];
            }
        }
        return null;
    }

    function findKingSquare(color) {
        for (let file of FILES) {
            for (let rank of RANKS) {
                const square = file + rank;
                const piece = chess.get(square);
                if (piece && piece.type === 'k' && piece.color === color) {
                    return square;
                }
            }
        }
        return null;
    }

    function handleSquareClick(square) {
        if (gameState.gameOver) return;
        
        const myTurn = (chess.turn() === 'w' && gameState.playerColor === 'white') ||
                       (chess.turn() === 'b' && gameState.playerColor === 'black');
        
        if (!myTurn) {
            showToast("It's not your turn", 'warning');
            return;
        }
        
        const piece = chess.get(square);
        
        // If clicking on own piece, select it
        if (piece && ((piece.color === 'w' && gameState.playerColor === 'white') ||
                      (piece.color === 'b' && gameState.playerColor === 'black'))) {
            selectSquare(square);
            return;
        }
        
        // If a piece is selected and clicking on a legal move, make the move
        if (gameState.selectedSquare && gameState.legalMoves.includes(square)) {
            attemptMove(gameState.selectedSquare, square);
            return;
        }
        
        // Clear selection
        gameState.selectedSquare = null;
        gameState.legalMoves = [];
        renderBoard();
    }

    function selectSquare(square) {
        gameState.selectedSquare = square;
        
        // Get legal moves for this piece
        const moves = chess.moves({ square: square, verbose: true });
        gameState.legalMoves = moves.map(m => m.to);
        
        renderBoard();
    }

    function attemptMove(from, to) {
        const piece = chess.get(from);
        
        // Check for pawn promotion
        if (piece && piece.type === 'p') {
            const targetRank = to.charAt(1);
            if ((piece.color === 'w' && targetRank === '8') ||
                (piece.color === 'b' && targetRank === '1')) {
                gameState.pendingPromotion = { from, to };
                showPromotionModal(piece.color);
                return;
            }
        }
        
        makeMove(from, to);
    }

    function makeMove(from, to, promotion = null) {
        const moveObj = {
            from: from,
            to: to
        };
        
        if (promotion) {
            moveObj.promotion = promotion;
        }
        
        const move = chess.move(moveObj);
        
        if (move) {
            gameState.lastMove = { from, to };
            gameState.selectedSquare = null;
            gameState.legalMoves = [];
            
            // Send move to server
            socket.emit('make_move', {
                move: move.san,
                fen: chess.fen(),
                pgn: chess.pgn(),
                turn: chess.turn(),
                is_check: chess.inCheck(),
                is_checkmate: chess.isCheckmate(),
                is_draw: chess.isDraw(),
                is_stalemate: chess.isStalemate()
            });
            
            // Play promotion sound
            if (promotion && sounds.promote) {
                sounds.promote();
            }
        }
    }

    function showPromotionModal(color) {
        const pieces = elements.promotionPieces.querySelectorAll('.promotion-piece');
        pieces.forEach(piece => {
            const pieceType = piece.dataset.piece;
            const pieceChar = color === 'w' ? pieceType.toUpperCase() : pieceType;
            piece.textContent = PIECES[pieceChar];
            piece.className = `promotion-piece piece-${color === 'w' ? 'white' : 'black'}`;
        });
        showModal('promotion-modal');
    }

    // ========================================
    // Timer Management
    // ========================================
    function startTimer() {
        if (!gameState.timeControl) return;
        
        stopTimer();
        
        timers.interval = setInterval(() => {
            if (gameState.gameOver) {
                stopTimer();
                return;
            }
            
            const currentTurn = chess.turn();
            
            if (currentTurn === 'w') {
                timers.white = Math.max(0, timers.white - 0.1);
            } else {
                timers.black = Math.max(0, timers.black - 0.1);
            }
            
            updateTimers();
            
            // Check for timeout
            if (timers.white <= 0 || timers.black <= 0) {
                stopTimer();
            }
        }, 100);
    }

    function stopTimer() {
        if (timers.interval) {
            clearInterval(timers.interval);
            timers.interval = null;
        }
    }

    function updateTimers() {
        if (!gameState.timeControl) return;
        
        const playerIsWhite = gameState.playerColor === 'white';
        const playerTime = playerIsWhite ? timers.white : timers.black;
        const opponentTime = playerIsWhite ? timers.black : timers.white;
        
        elements.playerTime.textContent = formatTime(playerTime);
        elements.opponentTime.textContent = formatTime(opponentTime);
        
        // Add low time warning
        if (playerTime !== null && playerTime < 30) {
            elements.playerTimer.classList.add('low-time');
        } else {
            elements.playerTimer.classList.remove('low-time');
        }
        
        if (opponentTime !== null && opponentTime < 30) {
            elements.opponentTimer.classList.add('low-time');
        } else {
            elements.opponentTimer.classList.remove('low-time');
        }
    }

    function updateTurnIndicator() {
        const currentTurn = chess.turn();
        const isPlayerTurn = (currentTurn === 'w' && gameState.playerColor === 'white') ||
                            (currentTurn === 'b' && gameState.playerColor === 'black');
        
        const playerInfo = document.querySelector('.player-self-info');
        const opponentInfo = document.querySelector('.opponent-info');
        
        if (isPlayerTurn) {
            playerInfo.classList.add('active-turn');
            opponentInfo.classList.remove('active-turn');
        } else {
            playerInfo.classList.remove('active-turn');
            opponentInfo.classList.add('active-turn');
        }
    }

    // ========================================
    // Move History
    // ========================================
    function updateMoveHistory() {
        const history = chess.history();
        elements.moveHistory.innerHTML = '';
        
        for (let i = 0; i < history.length; i += 2) {
            const moveNum = Math.floor(i / 2) + 1;
            const whiteMove = history[i] || '';
            const blackMove = history[i + 1] || '';
            
            const row = document.createElement('div');
            row.className = 'move-row';
            row.innerHTML = `
                <span class="move-number">${moveNum}.</span>
                <span class="move-white">${whiteMove}</span>
                <span class="move-black">${blackMove}</span>
            `;
            
            elements.moveHistory.appendChild(row);
        }
        
        // Scroll to bottom
        elements.moveHistory.scrollTop = elements.moveHistory.scrollHeight;
    }

    // ========================================
    // Captured Pieces
    // ========================================
    function updateCapturedPieces() {
        const startingPieces = {
            'w': { p: 8, n: 2, b: 2, r: 2, q: 1 },
            'b': { p: 8, n: 2, b: 2, r: 2, q: 1 }
        };
        
        const currentPieces = {
            'w': { p: 0, n: 0, b: 0, r: 0, q: 0 },
            'b': { p: 0, n: 0, b: 0, r: 0, q: 0 }
        };
        
        // Count current pieces
        for (let file of FILES) {
            for (let rank of RANKS) {
                const piece = chess.get(file + rank);
                if (piece && piece.type !== 'k') {
                    currentPieces[piece.color][piece.type]++;
                }
            }
        }
        
        // Calculate captured pieces
        const captured = {
            'w': {},
            'b': {}
        };
        
        for (let color of ['w', 'b']) {
            for (let type of ['q', 'r', 'b', 'n', 'p']) {
                const diff = startingPieces[color][type] - currentPieces[color][type];
                if (diff > 0) {
                    captured[color][type] = diff;
                }
            }
        }
        
        // Render captured pieces
        const playerCapturedColor = gameState.playerColor === 'white' ? 'b' : 'w';
        const opponentCapturedColor = gameState.playerColor === 'white' ? 'w' : 'b';
        
        elements.playerCaptured.innerHTML = renderCapturedPieces(captured[playerCapturedColor], playerCapturedColor);
        elements.opponentCaptured.innerHTML = renderCapturedPieces(captured[opponentCapturedColor], opponentCapturedColor);
    }

    function renderCapturedPieces(captured, color) {
        let html = '';
        for (let type of ['q', 'r', 'b', 'n', 'p']) {
            if (captured[type]) {
                const pieceChar = color === 'w' ? type.toUpperCase() : type;
                for (let i = 0; i < captured[type]; i++) {
                    html += `<span class="piece-${color === 'w' ? 'white' : 'black'}">${PIECES[pieceChar]}</span>`;
                }
            }
        }
        return html;
    }

    // ========================================
    // Chat
    // ========================================
    function addChatMessage(username, message, timestamp) {
        const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message';
        messageEl.innerHTML = `
            <div class="sender">${escapeHtml(username)}</div>
            <div class="text">${escapeHtml(message)}</div>
            <div class="time">${time}</div>
        `;
        
        elements.chatMessages.appendChild(messageEl);
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }

    function updateChatBadge() {
        if (unreadMessages > 0) {
            elements.chatBadge.textContent = unreadMessages > 9 ? '9+' : unreadMessages;
            elements.chatBadge.classList.remove('hidden');
        } else {
            elements.chatBadge.classList.add('hidden');
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========================================
    // Rooms List
    // ========================================
    function renderRoomsList(rooms) {
        if (rooms.length === 0) {
            elements.roomsList.innerHTML = '<p class="no-rooms">No rooms available. Create one!</p>';
            return;
        }
        
        elements.roomsList.innerHTML = rooms.map(room => `
            <div class="room-item" data-room-id="${room.room_id}">
                <div class="room-info">
                    <div class="room-host">${escapeHtml(room.host)}'s Room</div>
                    <div class="room-time">${room.time_control ? room.time_control + ' min' : 'No Limit'}</div>
                </div>
                <button class="btn btn-secondary join-room-btn" data-room-id="${room.room_id}">
                    Join
                </button>
            </div>
        `).join('');
        
        // Add click handlers
        elements.roomsList.querySelectorAll('.join-room-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const roomId = btn.dataset.roomId;
                joinRoom(roomId);
            });
        });
    }

    function joinRoom(roomId) {
        const username = elements.usernameInput.value.trim() || 'Anonymous';
        gameState.username = username;
        
        socket.emit('join_room', {
            username: username,
            room_id: roomId
        });
    }

    // ========================================
    // Event Listeners
    // ========================================
    function initEventListeners() {
        // Time control buttons
        elements.timeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.timeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Create game
        elements.createGameBtn.addEventListener('click', () => {
            const username = elements.usernameInput.value.trim() || 'Anonymous';
            const activeTimeBtn = document.querySelector('.time-btn.active');
            const timeControl = activeTimeBtn.dataset.time === 'null' ? null : parseInt(activeTimeBtn.dataset.time);
            
            gameState.username = username;
            
            socket.emit('create_room', {
                username: username,
                time_control: timeControl
            });
        });
        
        // Join game
        elements.joinGameBtn.addEventListener('click', () => {
            const roomCode = elements.roomCodeInput.value.trim().toUpperCase();
            if (!roomCode) {
                showToast('Please enter a room code', 'warning');
                return;
            }
            joinRoom(roomCode);
        });
        
        // Refresh rooms
        elements.refreshRoomsBtn.addEventListener('click', () => {
            socket.emit('get_rooms');
        });
        
        // Copy room code
        elements.copyCodeBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(gameState.roomId).then(() => {
                showToast('Room code copied!', 'success');
            });
        });
        
        // Cancel waiting
        elements.cancelWaitingBtn.addEventListener('click', () => {
            showScreen('lobby-screen');
            socket.emit('leave_room');
        });
        
        // Resign button
        elements.resignBtn.addEventListener('click', () => {
            if (!gameState.gameOver) {
                showModal('resign-modal');
            }
        });
        
        // Confirm resign
        elements.confirmResignBtn.addEventListener('click', () => {
            hideModal('resign-modal');
            socket.emit('resign');
        });
        
        // Cancel resign
        elements.cancelResignBtn.addEventListener('click', () => {
            hideModal('resign-modal');
        });
        
        // Draw button
        elements.drawBtn.addEventListener('click', () => {
            if (!gameState.gameOver) {
                socket.emit('offer_draw');
                showToast('Draw offer sent', 'info');
            }
        });
        
        // Accept draw
        elements.acceptDrawBtn.addEventListener('click', () => {
            hideModal('draw-offer-modal');
            socket.emit('accept_draw');
        });
        
        // Decline draw
        elements.declineDrawBtn.addEventListener('click', () => {
            hideModal('draw-offer-modal');
            socket.emit('decline_draw');
        });
        
        // Flip board
        elements.flipBoardBtn.addEventListener('click', () => {
            gameState.isFlipped = !gameState.isFlipped;
            renderBoard();
        });
        
        // Chat toggle
        elements.chatToggleBtn.addEventListener('click', () => {
            elements.chatPanel.classList.toggle('hidden');
            if (!elements.chatPanel.classList.contains('hidden')) {
                unreadMessages = 0;
                updateChatBadge();
            }
        });
        
        // Send chat
        elements.sendChatBtn.addEventListener('click', sendChatMessage);
        elements.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
        
        // Theme toggle
        elements.themeToggle.addEventListener('click', () => {
            elements.themeDropdown.classList.toggle('hidden');
        });
        
        // Theme selection
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                setTheme(option.dataset.theme);
                elements.themeDropdown.classList.add('hidden');
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!elements.themeToggle.contains(e.target) && !elements.themeDropdown.contains(e.target)) {
                elements.themeDropdown.classList.add('hidden');
            }
        });
        
        // Sound toggle
        elements.soundToggle.addEventListener('click', () => {
            gameState.soundEnabled = !gameState.soundEnabled;
            elements.soundToggle.innerHTML = gameState.soundEnabled 
                ? '<i class="fas fa-volume-up"></i>' 
                : '<i class="fas fa-volume-mute"></i>';
            showToast(gameState.soundEnabled ? 'Sound enabled' : 'Sound disabled', 'info');
        });
        
        // Promotion pieces
        elements.promotionPieces.querySelectorAll('.promotion-piece').forEach(piece => {
            piece.addEventListener('click', () => {
                const promotionPiece = piece.dataset.piece;
                hideModal('promotion-modal');
                
                if (gameState.pendingPromotion) {
                    makeMove(gameState.pendingPromotion.from, gameState.pendingPromotion.to, promotionPiece);
                    gameState.pendingPromotion = null;
                }
            });
        });
        
        // Play again
        elements.playAgainBtn.addEventListener('click', () => {
            hideModal('game-over-modal');
            resetGame();
            showScreen('lobby-screen');
        });
        
        // Back to lobby
        elements.backToLobbyBtn.addEventListener('click', () => {
            hideModal('game-over-modal');
            resetGame();
            showScreen('lobby-screen');
        });
        
        // Enter key for room code
        elements.roomCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                elements.joinGameBtn.click();
            }
        });
        
        // Enter key for username
        elements.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                elements.createGameBtn.click();
            }
        });
    }

    function sendChatMessage() {
        const message = elements.chatInput.value.trim();
        if (message) {
            socket.emit('chat_message', { message: message });
            elements.chatInput.value = '';
        }
    }

    function resetGame() {
        gameState.roomId = null;
        gameState.playerColor = null;
        gameState.opponent = null;
        gameState.timeControl = null;
        gameState.isMyTurn = false;
        gameState.gameStarted = false;
        gameState.gameOver = false;
        gameState.selectedSquare = null;
        gameState.legalMoves = [];
        gameState.lastMove = null;
        gameState.isFlipped = false;
        gameState.pendingPromotion = null;
        
        stopTimer();
        timers.white = null;
        timers.black = null;
        
        if (gameState.disconnectInterval) {
            clearInterval(gameState.disconnectInterval);
        }
        
        chess = null;
    }

    // ========================================
    // Initialization
    // ========================================
    function init() {
        // Cache DOM elements
        cacheElements();
        
        // Initialize theme
        initTheme();
        
        // Initialize sounds
        initSounds();
        
        // Initialize socket
        initSocket();
        
        // Initialize event listeners
        initEventListeners();
        
        // Request initial rooms list
        setTimeout(() => {
            socket.emit('get_rooms');
        }, 500);
        
        // Hide loading screen
        setTimeout(() => {
            elements.loadingScreen.classList.add('hidden');
            elements.app.classList.remove('hidden');
        }, 1500);
    }

    // Start the app
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
