#!/usr/bin/env python3
"""
/google-workspace-oauth-setup — UI prompt con evidencia TOS + paso a paso.
No usa enumerate; pasos debajo de cada input. Versión tkinter (python3 nativo).
"""
import tkinter as tk
from tkinter import messagebox

def run():
    root = tk.Tk()
    root.title("Configuración Inicial del Google Workspace Apps MCP")
    root.geometry("1300x540")
    root.configure(bg="#181818")

    # Preguntas originales reemplazadas por header grid-in-grid (abajo)

    # Grid-in-grid: preguntas (izq) || referencias (der) — compacto simétrico
    top = tk.Frame(root, bg="#181818")
    top.pack(pady=2, padx=10, fill="none")
    top.grid_columnconfigure(0, weight=1)
    top.grid_columnconfigure(1, weight=0)
    top.grid_columnconfigure(2, weight=1)

    # Izquierda: preguntas (compacto, igual densidad que referencias)
    left = tk.Frame(top, bg="#181818")
    left.grid(row=0, column=0, sticky="nsw", padx=4)
    # Sub-frame centrado verticalmente para las preguntas
    left_content = tk.Frame(left, bg="#181818")
    left_content.pack(expand=True, pady=0)
    tk.Label(left_content, text="¿Qué estoy solicitándote?", bg="#181818", fg="#ddd", font=("Segoe UI", 10, "bold"), wraplength=600, anchor="w", justify="left").pack(anchor="w", pady=0)
    tk.Label(left_content, text="Configurar tu propio OAuth client_id + remote rclone (gdrive) para que el MCP 'google-workspace-apps-mcp' sincronice sin exponer credenciales.", bg="#181818", fg="#ccc", font=("Segoe UI", 8), wraplength=600, anchor="w", justify="left").pack(anchor="w", pady=0)
    tk.Label(left_content, text="¿Por qué motivo?", bg="#181818", fg="#ddd", font=("Segoe UI", 10, "bold"), wraplength=600, anchor="w", justify="left").pack(anchor="w", pady=0)
    tk.Label(left_content, text="Google obliga (TOS y políticas OAuth) a que cada aplicación tenga su propio OAuth client para acceder a Drive. No puedes usar credenciales compartidas ni embebidas (ver evidencia TOS a continuación). Por eso debes ir a console.cloud.google.com y crear tu propio proyecto para sincronizar con rclone.", bg="#181818", fg="#ccc", font=("Segoe UI", 8), wraplength=600, anchor="w", justify="left").pack(anchor="w", pady=0)

    # Derecha: referencias compactas clickeables (APA)
    import webbrowser
    # Col=1: advertencia UX (entre preguntas y referencias APA)
    warn = tk.Frame(top, bg="#4a2d00", highlightbackground="#f59e0b", highlightthickness=2)
    warn.grid(row=0, column=1, sticky="nse", padx=6)
    tk.Label(warn, text="⚠  ADVERTENCIA — Google Cloud (trial / 2FA)", bg="#4a2d00", fg="#f59e0b", font=("Segoe UI", 9, "bold")).pack(anchor="w", padx=8, pady=(4,1))
    for wline in ["• Trial gratuito: requiere tarjeta (crédito ~USD 30, 90 días; no se cobra si cancelas antes).", "• Google exige 2FA (MFA) para console.cloud.google.com; prepara Authenticator.", "• Esto es para crear tu propio OAuth client. El MCP NO funciona sin ese paso."]:
        tk.Label(warn, text=wline, bg="#4a2d00", fg="#e5e7eb", font=("Segoe UI", 8), anchor="w", justify="left").pack(anchor="w", padx=8)
    ref_right = tk.Frame(top, bg="#181818")
    ref_right.grid(row=0, column=2, sticky="nse", padx=4)
    ref_content = tk.Frame(ref_right, bg="#181818")
    ref_content.pack(expand=True, pady=0)
    tk.Label(top, text="", bg="#181818", width=6).grid(row=0, column=1, sticky="w", padx=2)
    tk.Label(ref_content, text="Referencias Legales", bg="#181818", fg="#ddd", font=("Segoe UI", 9, "bold"), anchor="w").pack(anchor="w", pady=1)
    for ut, url in [
        ("• Google APIs Terms (§b.1): 'Developer credentials ... may not be embedded in open source projects.'", "https://dev.google.com/terms"),
        ("→ dev.google.com/terms", "https://dev.google.com/terms"),
        ("• OAuth 2.0 Policies: 'Every app must have its own OAuth client.'", "https://developers.google.com/identity/protocols/oauth2"),
        ("→ developers.google.com/identity/protocols/oauth2", "https://developers.google.com/identity/protocols/oauth2"),
        ("• rclone.org/drive — Making your own client-id", "https://rclone.org/drive/#making-your-own-client-id"),
        ("→ rclone.org/drive/#making-your-own-client-id", "https://rclone.org/drive/#making-your-own-client-id"),
        ("• newscrewdriver — Limiting Google client-id exposure", "https://newscydriver.com/2016/12/27/limiting-google-client-id-exposure/"),
        ("→ newscydriver.com/2016/12/27/limiting-google-client-id-exposure/", "https://newscydriver.com/2016/12/27/limiting-google-client-id-exposure/"),
    ]:
        if ut.startswith("• "):
            lbl = tk.Label(ref_content, text=ut, bg="#181818", fg="#ccc", font=("Segoe UI", 8), wraplength=300, anchor="w", justify="left")
        else:
            lbl = tk.Label(ref_content, text=ut, bg="#181818", fg="#55aaff", font=("Segoe UI", 8, "underline"), cursor="hand2", anchor="w")
            lbl.bind("<Button-1>", lambda e, u=url: webbrowser.open(u))
        lbl.pack(anchor="center", expand=True, fill="x", pady=0)

# 3. FORMULARIO — 4 campos manuales, paso DEBAJO de cada input
    form = tk.LabelFrame(root, text="  Configuración paso a paso (cada paso debajo del campo)  ",
                         bg="#181818", fg="#ccc", font=("Segoe UI", 10, "bold"))
    form.pack(pady=8, padx=10, fill="x")
    for i in range(4):
        form.grid_columnconfigure(i, weight=1, uniform="step")

    # Campo 1 — CLIENT_ID (paso / input / instrucciones verticales)
    r1 = tk.Frame(form, bg="#181818")
    r1.grid(row=0, column=0, sticky="new", pady=6, padx=4)
    tk.Label(r1, text="› Paso 1: GOOGLE_CLIENT_ID", bg="#181818", fg="#ddd", font=("Segoe UI", 10, "bold"), anchor="w").pack(anchor="w", pady=2)
    ent_client = tk.Entry(r1, bg="#222", fg="#fff", insertbackground="#fff", font=("Segoe UI", 10), width=55)
    ent_client.pack(anchor="w", pady=2)
    sb1 = tk.Frame(r1, bg="#181818")
    sb1.pack(anchor="w", pady=1)
    tk.Label(sb1, text="• https://console.cloud.google.com/", bg="#181818", fg="#55aaff", font=("Segoe UI", 8, "underline"), cursor="hand2", anchor="w").pack(anchor="w")
    sb1.children[list(sb1.children.keys())[-1]].bind("<Button-1>", lambda e: __import__("webbrowser").open("https://console.cloud.google.com/"))
    tk.Label(sb1, text="→ Proyecto", bg="#181818", fg="#aaa", font=("Segoe UI", 8), anchor="w").pack(anchor="w")
    tk.Label(sb1, text="→ APIs & Services", bg="#181818", fg="#aaa", font=("Segoe UI", 8), anchor="w").pack(anchor="w")
    tk.Label(sb1, text="→ Credenciales", bg="#181818", fg="#aaa", font=("Segoe UI", 8), anchor="w").pack(anchor="w")
    tk.Label(sb1, text="→ OAuth client ID", bg="#181818", fg="#aaa", font=("Segoe UI", 8), anchor="w").pack(anchor="w")
    tk.Label(sb1, text="→ Desktop app", bg="#181818", fg="#aaa", font=("Segoe UI", 8), anchor="w").pack(anchor="w")

    # Campo 2 — CLIENT_SECRET (vertical)
    r2 = tk.Frame(form, bg="#181818")
    r2.grid(row=0, column=1, sticky="new", pady=6, padx=4)
    tk.Label(r2, text="› Paso 2: GOOGLE_CLIENT_SECRET", bg="#181818", fg="#ddd", font=("Segoe UI", 10, "bold"), anchor="w").pack(anchor="w", pady=2)
    ent_secret = tk.Entry(r2, bg="#222", fg="#fff", insertbackground="#fff", font=("Segoe UI", 10), show="*", width=55)
    ent_secret.pack(anchor="w", pady=2)
    sb2 = tk.Frame(r2, bg="#181818")
    sb2.pack(anchor="w", pady=1)
    tk.Label(sb2, text="• Copiar Client ID + Client Secret", bg="#181818", fg="#aaa", font=("Segoe UI", 8), anchor="w").pack(anchor="w")
    tk.Label(sb2, text="→ NO compartir", bg="#181818", fg="#aaa", font=("Segoe UI", 8), anchor="w").pack(anchor="w")
    tk.Label(sb2, text="→ NO en repo (evidencia TOS: conf. no embedded)", bg="#181818", fg="#aaa", font=("Segoe UI", 8), anchor="w").pack(anchor="w")

    # Campo 3 — REMOTE (vertical)
    r3 = tk.Frame(form, bg="#181818")
    r3.grid(row=0, column=2, sticky="new", pady=6, padx=4)
    tk.Label(r3, text="› Paso 3: RCLONE_REMOTE (default: gdrive)", bg="#181818", fg="#ddd", font=("Segoe UI", 10, "bold"), anchor="w").pack(anchor="w", pady=2)
    ent_remote = tk.Entry(r3, bg="#222", fg="#fff", insertbackground="#fff", font=("Segoe UI", 10), width=55)
    ent_remote.insert(0, "gdrive")
    ent_remote.pack(anchor="w", pady=2)
    sb3 = tk.Frame(r3, bg="#181818")
    sb3.pack(anchor="w", pady=1)
    tk.Label(sb3, text="• rclone config", bg="#181818", fg="#aaa", font=("Segoe UI", 8), anchor="w").pack(anchor="w")
    tk.Label(sb3, text="→ remote = gdrive (interactivo)", bg="#181818", fg="#aaa", font=("Segoe UI", 8), anchor="w").pack(anchor="w")

    # Campo 4 — FOLDER_ID + Paso 4 (texto izquierda / input derecha)
    r4 = tk.Frame(form, bg="#181818")
    r4.grid(row=0, column=3, sticky="new", pady=6, padx=4)
    tk.Label(r4, text="› Paso 4: GOOGLE_DRIVE_FOLDER_ID (opcional)", bg="#181818", fg="#ddd", font=("Segoe UI", 10, "bold"), anchor="w").pack(anchor="w", pady=2)
    ent_folder = tk.Entry(r4, bg="#222", fg="#fff", insertbackground="#fff", font=("Segoe UI", 10), width=55)
    ent_folder.pack(anchor="w", pady=2)
    sb4 = tk.Frame(r4, bg="#181818")
    sb4.pack(anchor="w", pady=1)
    tk.Label(sb4, text="• Verificar: rclone lsf gdrive:", bg="#181818", fg="#aaa", font=("Segoe UI", 8), anchor="w").pack(anchor="w")
    tk.Label(sb4, text="→ Configurar ENV: export RCLONE_REMOTE=gdrive", bg="#181818", fg="#aaa", font=("Segoe UI", 8), anchor="w").pack(anchor="w")
    form.grid_columnconfigure(0, weight=1)

    # 5. BOTONES
    btns = tk.Frame(root, bg="#181818")
    btns.pack(pady=10)
    def save():
        import os, json
        try:
            os.makedirs(os.path.expanduser("~/.config/google-workspace"), exist_ok=True)
            with open(os.path.expanduser("~/.config/google-workspace/client_id"), "w") as f:
                f.write(ent_client.get().strip())
            with open(os.path.expanduser("~/.config/google-workspace/client_secret"), "w") as f:
                f.write(ent_secret.get().strip())
            remote = ent_remote.get().strip() or "gdrive"
            with open(os.path.expanduser("~/.rclone-config.json"), "w") as f:
                json.dump({"remote": remote}, f)
            messagebox.showinfo("OK", "Guardado local (NO repo). Luego: rclone config (si aún no configurado) o verificar con rclone lsf gdrive:")
            root.destroy()
        except Exception as e:
            messagebox.showerror("Error", str(e))
    tk.Button(btns, text="Aceptar — guardar local", command=save,
              bg="#0a84ff", fg="#fff", font=("Segoe UI", 10, "bold")).pack(side="left", padx=6)
    tk.Button(btns, text="Cancelar", command=root.destroy,
              bg="#333", fg="#fff").pack(side="left", padx=6)

    root.mainloop()

if __name__ == "__main__":
    run()
