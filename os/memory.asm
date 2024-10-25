section .text

init_memory:
    ; Initialize system memory
    mov edi, window_buffer
    mov ecx, WINDOW_WIDTH * WINDOW_HEIGHT * 4
    xor eax, eax
    rep stosd
    ret

allocate_window:
    ; Window allocation logic
    push ebp
    mov ebp, esp
    
    ; Calculate window size
    mov eax, [ebp+8]     ; width
    mov ebx, [ebp+12]    ; height
    mul ebx
    
    ; Allocate memory
    mov ecx, eax
    call sys_alloc
    
    pop ebp
    ret
