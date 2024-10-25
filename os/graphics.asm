section .text

update_display:
    ; Copy buffer to video memory
    mov esi, window_buffer
    mov edi, 0xA0000    ; VGA memory address
    mov ecx, WINDOW_WIDTH * WINDOW_HEIGHT
    rep movsd
    ret

draw_taskbar:
    ; Draw taskbar at bottom
    mov edi, window_buffer + (WINDOW_HEIGHT-40) * WINDOW_WIDTH * 4
    mov ecx, WINDOW_WIDTH * 40
    mov eax, 0x1A1A1A    ; Dark gray
    rep stosd
    ret

draw_start_button:
    ; Draw start button
    mov edi, window_buffer + (WINDOW_HEIGHT-35) * WINDOW_WIDTH * 4 + 5 * 4
    mov ecx, 60
    mov eax, 0x39FF14    ; Green
    rep stosd
    ret
