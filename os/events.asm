section .text

event_loop:
    ; Check for keyboard input
    mov ah, 0x01
    int 0x16
    jz .no_input
    
    ; Handle keyboard input
    mov ah, 0x00
    int 0x16
    
    cmp al, 27     ; ESC key
    je exit_program
    
    jmp event_loop
    
.no_input:
    ; Update display
    call update_display
    jmp event_loop
