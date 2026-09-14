import sys
import os

# Đảm bảo đường dẫn gốc backend có trong sys.path để import app.*
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
