section .data
    ; Window dimensions
    WINDOW_WIDTH    equ 800
    WINDOW_HEIGHT   equ 600
    
    ; Colors
    BG_COLOR        equ 0xF0F0F0    ; Light gray
    WINDOW_COLOR    equ 0x333333    ; Dark gray
    
    ; Window title
    title           db "SC os 1.1", 0
    
    ; System calls
    SYS_EXIT        equ 1
    SYS_WRITE       equ 4
    
section .bss
    window_buffer   resb WINDOW_WIDTH * WINDOW_HEIGHT * 4  ; 32-bit color buffer
    
section .text
global _start

_start:
    ; Initialize display
    call init_display
    
    ; Draw main window
    call draw_window
    
    ; Main event loop
    call event_loop
    
    ; Exit program
    mov eax, SYS_EXIT
    xor ebx, ebx
    int 0x80
