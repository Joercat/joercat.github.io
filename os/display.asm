section .text

init_display:
    ; Set up video mode
    mov ax, 0x13    ; VGA 320x200 256 colors
    int 0x10
    ret

draw_window:
    ; Draw window background
    mov edi, window_buffer
    mov ecx, WINDOW_WIDTH * WINDOW_HEIGHT
    mov eax, BG_COLOR
    rep stosd
    
    ; Draw window frame
    call draw_frame
    ret

draw_frame:
    ; Draw window borders
    push ebp
    mov ebp, esp
    
    ; Top border
    mov edi, window_buffer
    mov ecx, WINDOW_WIDTH
    mov eax, WINDOW_COLOR
    rep stosd
    
    ; Bottom border
    mov edi, window_buffer + (WINDOW_HEIGHT-1) * WINDOW_WIDTH * 4
    mov ecx, WINDOW_WIDTH  
    rep stosd
    
    ; Left and right borders
    mov ecx, WINDOW_HEIGHT
    
    .vertical_borders:
        mov dword [window_buffer + ecx * WINDOW_WIDTH * 4], WINDOW_COLOR
        mov dword [window_buffer + ecx * WINDOW_WIDTH * 4 + (WINDOW_WIDTH-1) * 4], WINDOW_COLOR
        loop .vertical_borders
    
    pop ebp
    ret
