class ScientificCalculator {
    constructor() {
        this.display = document.getElementById('display');
        this.historyContent = document.getElementById('historyContent');
        this.historySidebar = document.getElementById('historySidebar');
        this.calculatorButtons = document.getElementById('calculatorButtons');
        
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.waitingForOperand = false;
        this.memory = 0;
        this.history = [];
        this.angleMode = 'DEG'; // DEG or RAD
        
        this.initializeEventListeners();
        this.loadHistory();
        this.updateDisplay();
    }

    initializeEventListeners() {
        // Botones de la calculadora científica (visibles por defecto)
        document.querySelectorAll('#calculatorButtons .btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleButtonClick(e.target);
            });
        });

        // Teclado
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });

        // Botón de modo móvil
        const mobileToggleBtn = document.getElementById('mobileToggleBtn');
        if (mobileToggleBtn) {
            mobileToggleBtn.addEventListener('click', () => {
                console.log('Botón móvil presionado');
                this.toggleMobileMode();
            });
            console.log('Event listener del botón móvil agregado');
        } else {
            console.log('Botón móvil no encontrado');
        }

        // Navegación lateral
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                if (mode === 'basica') {
                    this.switchMode('basic');
                } else if (mode === 'cientifica') {
                    this.switchMode('scientific');
                }
                
                // Actualizar navegación activa
                document.querySelectorAll('.nav-item').forEach(nav => {
                    nav.classList.remove('active');
                });
                e.currentTarget.classList.add('active');
            });
        });

        // Botón de Código QR
        const qrToggleBtn = document.getElementById('qrToggleBtn');
        if (qrToggleBtn) {
            qrToggleBtn.addEventListener('click', () => {
                this.toggleQRSection();
            });
        }

        // Botón de copiar URL
        const copyUrlBtn = document.getElementById('copyUrlBtn');
        if (copyUrlBtn) {
            copyUrlBtn.addEventListener('click', () => {
                this.copyGitHubURL();
            });
        }

        // Historial
        document.querySelector('.history-toggle').addEventListener('click', () => {
            this.toggleHistory();
        });

        document.getElementById('closeHistory').addEventListener('click', () => {
            this.closeHistory();
        });

        document.getElementById('clearHistory').addEventListener('click', () => {
            this.clearHistory();
        });

    }

    handleButtonClick(button) {
        const action = button.dataset.action;
        const value = button.dataset.value;

        if (value !== undefined) {
            this.inputDigit(value);
        } else if (action) {
            this.handleOperation(action);
        }
    }

    handleKeyPress(e) {
        if (e.key >= '0' && e.key <= '9') {
            this.inputDigit(e.key);
        } else if (e.key === '.') {
            this.handleOperation('.');
        } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
            this.handleOperation(e.key);
        } else if (e.key === 'Enter' || e.key === '=') {
            this.handleOperation('=');
        } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
            this.handleOperation('C');
        } else if (e.key === 'Backspace') {
            this.handleOperation('backspace');
        }
    }

    inputDigit(digit) {
        if (this.waitingForOperand) {
            this.currentValue = digit;
            this.waitingForOperand = false;
        } else {
            this.currentValue = this.currentValue === '0' ? digit : this.currentValue + digit;
        }
        this.updateDisplay();
    }

    handleOperation(action) {
        const inputValue = parseFloat(this.currentValue);

        switch (action) {
            case 'C':
                this.clear();
                break;
                
            case 'backspace':
                this.backspace();
                break;
                
            case '.':
                this.inputDecimal();
                break;
                
            case '+':
            case '-':
            case '*':
            case '/':
                this.performOperation(action);
                break;
                
            case '=':
                this.calculate();
                break;
                
            case '%':
                this.currentValue = (inputValue / 100).toString();
                this.updateDisplay();
                break;
                
            // Funciones científicas
            case 'sin':
                this.currentValue = Math.sin(this.toRadians(inputValue)).toString();
                this.updateDisplay();
                break;
                
            case 'cos':
                this.currentValue = Math.cos(this.toRadians(inputValue)).toString();
                this.updateDisplay();
                break;
                
            case 'tan':
                this.currentValue = Math.tan(this.toRadians(inputValue)).toString();
                this.updateDisplay();
                break;
                
            case 'log':
                this.currentValue = Math.log10(inputValue).toString();
                this.updateDisplay();
                break;
                
            case 'ln':
                this.currentValue = Math.log(inputValue).toString();
                this.updateDisplay();
                break;
                
            case 'x2':
                this.currentValue = Math.pow(inputValue, 2).toString();
                this.updateDisplay();
                break;
                
            case 'sqrt':
                this.currentValue = Math.sqrt(inputValue).toString();
                this.updateDisplay();
                break;
                
            case 'pow':
                this.performOperation('pow');
                break;
                
            case 'factorial':
                this.currentValue = this.factorial(Math.floor(inputValue)).toString();
                this.updateDisplay();
                break;
                
            case 'reciprocal':
                this.currentValue = (1 / inputValue).toString();
                this.updateDisplay();
                break;
                
            case 'pi':
                this.currentValue = Math.PI.toString();
                this.updateDisplay();
                break;
                
            case 'e':
                this.currentValue = Math.E.toString();
                this.updateDisplay();
                break;
                
            case 'abs':
                this.currentValue = Math.abs(inputValue).toString();
                this.updateDisplay();
                break;
                
            case 'exp':
                this.currentValue = Math.exp(inputValue).toString();
                this.updateDisplay();
                break;
                
            case 'mod':
                this.performOperation('mod');
                break;
                
            case 'lparen':
                if (this.waitingForOperand || this.currentValue === '0') {
                    this.currentValue = '(';
                    this.waitingForOperand = false;
                } else {
                    this.currentValue += '(';
                }
                this.updateDisplay();
                break;
                
            case 'rparen':
                this.currentValue += ')';
                this.updateDisplay();
                break;
                
            // Funciones de memoria
            case 'MC':
                this.memory = 0;
                break;
                
            case 'MR':
                this.currentValue = this.memory.toString();
                this.updateDisplay();
                break;
                
            case 'M+':
                this.memory += inputValue;
                break;
                
            case 'M-':
                this.memory -= inputValue;
                break;
                
            case 'MS':
                this.memory = inputValue;
                break;
                
            case 'M':
                this.currentValue = this.memory.toString();
                this.updateDisplay();
                break;
        }
    }

    performOperation(nextOperation) {
        const inputValue = parseFloat(this.currentValue);

        if (this.previousValue === '' || this.operation === null) {
            this.previousValue = this.currentValue;
        } else if (this.operation && !this.waitingForOperand) {
            const currentValue = parseFloat(this.currentValue);
            const newValue = this.calculateResult();

            this.currentValue = String(newValue);
            this.previousValue = this.currentValue;
        }

        this.waitingForOperand = true;
        this.operation = nextOperation;
        this.updateDisplay();
    }

    calculate() {
        if (this.operation && this.previousValue !== '') {
            const expression = `${this.previousValue} ${this.operation} ${this.currentValue}`;
            const result = this.calculateResult();
            
            this.addToHistory(expression, result);
            
            this.currentValue = String(result);
            this.previousValue = '';
            this.operation = null;
            this.waitingForOperand = false;
            this.updateDisplay();
        }
    }

    calculateResult() {
        const inputValue = parseFloat(this.currentValue);
        const previousValue = parseFloat(this.previousValue);

        switch (this.operation) {
            case '+':
                return previousValue + inputValue;
            case '-':
                return previousValue - inputValue;
            case '*':
                return previousValue * inputValue;
            case '/':
                return previousValue / inputValue;
            case 'pow':
                return Math.pow(previousValue, inputValue);
            case 'mod':
                return previousValue % inputValue;
            default:
                return inputValue;
        }
    }

    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.waitingForOperand = false;
        this.updateDisplay();
    }

    backspace() {
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
        this.updateDisplay();
    }

    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentValue = '0.';
            this.waitingForOperand = false;
        } else if (this.currentValue.indexOf('.') === -1) {
            this.currentValue += '.';
        }
        this.updateDisplay();
    }

    toRadians(degrees) {
        return this.angleMode === 'DEG' ? degrees * (Math.PI / 180) : degrees;
    }

    factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    updateDisplay() {
        // Limitar la longitud del display
        let displayValue = this.currentValue;
        
        // Mostrar la operación completa cuando hay una operación pendiente
        if (this.operation && this.previousValue !== '') {
            if (this.waitingForOperand) {
                // Mostrar solo la operación anterior esperando el siguiente número
                displayValue = `${this.previousValue} ${this.getOperationSymbol(this.operation)}`;
            } else {
                // Mostrar la operación completa mientras se ingresa el segundo número
                displayValue = `${this.previousValue} ${this.getOperationSymbol(this.operation)} ${this.currentValue}`;
            }
        }
        
        // Limitar la longitud del display
        if (displayValue.length > 25) {
            displayValue = displayValue.substring(0, 25) + '...';
        }
        this.display.textContent = displayValue;
    }

    getOperationSymbol(operation) {
        const symbols = {
            '+': '+',
            '-': '−',
            '*': '×',
            '/': '÷',
            'pow': '^',
            'mod': 'mod'
        };
        return symbols[operation] || operation;
    }

    switchMode(mode) {
        const container = document.querySelector('.calculator-container');
        const scientificButtons = document.getElementById('calculatorButtons');
        const basicButtons = document.getElementById('basicCalculatorButtons');
        const qrSection = document.getElementById('qrSection');
        const historySidebar = document.getElementById('historySidebar');
        const mainContent = document.querySelector('.main-content');

        // Ocultar sección QR si está visible
        if (qrSection) {
            qrSection.style.display = 'none';
        }

        // Restaurar sidebar derecho y main content
        historySidebar.style.display = 'flex';
        mainContent.style.maxWidth = '';

        // Mostrar calculadora
        container.style.display = 'flex';

        if (mode === 'basic') {
            container.classList.add('basic-mode');
            scientificButtons.style.display = 'none';
            basicButtons.style.display = 'grid';
            
            // Agregar event listeners a los botones básicos solo una vez
            if (!basicButtons.hasAttribute('data-listeners-added')) {
                basicButtons.querySelectorAll('.btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        this.handleButtonClick(e.target);
                    });
                });
                basicButtons.setAttribute('data-listeners-added', 'true');
            }
        } else {
            container.classList.remove('basic-mode');
            scientificButtons.style.display = 'grid';
            basicButtons.style.display = 'none';
        }
    }

    toggleHistory() {
        this.historySidebar.classList.add('active');
    }

    closeHistory() {
        this.historySidebar.classList.remove('active');
    }

    toggleMobileMode() {
        console.log('Botón móvil presionado');
        const container = document.querySelector('.container');
        container.classList.toggle('mobile-mode');
        console.log('Clase mobile-mode toggled:', container.classList.contains('mobile-mode'));
    }

    toggleQRSection() {
        const qrSection = document.getElementById('qrSection');
        const calculatorContainer = document.querySelector('.calculator-container');
        const navItems = document.querySelectorAll('.nav-item');
        const historySidebar = document.getElementById('historySidebar');
        const mainContent = document.querySelector('.main-content');
        
        // Ocultar calculadora y sidebar derecho
        calculatorContainer.style.display = 'none';
        historySidebar.style.display = 'none';
        
        // Mostrar sección QR con todo el ancho
        qrSection.style.display = 'block';
        mainContent.style.maxWidth = '100%';
        
        // Actualizar navegación activa
        navItems.forEach(item => item.classList.remove('active'));
        document.getElementById('qrToggleBtn').classList.add('active');
    }

    copyGitHubURL() {
        const url = 'https://gabrielfxm.github.io';
        navigator.clipboard.writeText(url).then(() => {
            const copyBtn = document.getElementById('copyUrlBtn');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '¡Copiado!';
            copyBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = 'linear-gradient(135deg, #00d4ff, #0099cc)';
            }, 2000);
        }).catch(err => {
            console.error('Error al copiar URL:', err);
        });
    }

    addToHistory(expression, result) {
        const historyItem = {
            expression: expression,
            result: result,
            timestamp: new Date().toISOString()
        };
        
        this.history.unshift(historyItem);
        if (this.history.length > 50) {
            this.history.pop();
        }
        
        this.saveHistory();
        this.renderHistory();
    }

    renderHistory() {
        this.historyContent.innerHTML = '';
        
        this.history.forEach(item => {
            const historyElement = document.createElement('div');
            historyElement.className = 'history-item';
            historyElement.innerHTML = `
                <span class="history-expression">${item.expression}</span>
                <span class="history-result">= ${item.result}</span>
            `;
            
            historyElement.addEventListener('click', () => {
                this.currentValue = item.result.toString();
                this.updateDisplay();
                this.closeHistory();
            });
            
            this.historyContent.appendChild(historyElement);
        });
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
    }

    saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
    }

    loadHistory() {
        const savedHistory = localStorage.getItem('calculatorHistory');
        if (savedHistory) {
            this.history = JSON.parse(savedHistory);
            this.renderHistory();
        }
    }

}

// Inicializar la calculadora cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    new ScientificCalculator();
});

// Prevenir el zoom en dispositivos móviles al hacer doble tap
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
});

let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);
