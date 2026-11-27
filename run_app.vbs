Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")
currentDir = FSO.GetParentFolderName(WScript.ScriptFullName)

' 1. Start Python FastAPI Backend on Port 8001 (0 = Hidden / Silent Window)
WshShell.Run "cmd /c ""cd /d """ & currentDir & "\backend"" && python -m uvicorn app.main:app --port 8001 --host 0.0.0.0 --reload""", 0, False

' 2. Start Vite Frontend on Port 5173 (0 = Hidden / Silent Window)
WshShell.Run "cmd /c ""cd /d """ & currentDir & "\frontend"" && npm run dev""", 0, False

' 3. Wait 3 seconds for servers to boot
WScript.Sleep 3500

' 4. Open Default Web Browser
WshShell.Run "http://localhost:5173"
