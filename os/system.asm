section .text

sys_alloc:
    ; System memory allocation
    push ebx
    mov eax, 45         ; sys_brk
    xor ebx, ebx
    int 0x80
    
    add ebx, ecx
    mov eax, 45
    int 0x80
    pop ebx
    ret

exit_program:
    ; Clean exit
    mov eax, SYS_EXIT
    xor ebx, ebx
    int 0x80
