import smtplib
import os
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Vua Linh Kiện")

def send_email(to_email: str, subject: str, html_content: str):
    """Gửi email thông qua SMTP. Nếu chưa cấu hình, in ra màn hình console để debug."""
    
    # Nếu chưa cấu hình app password, Mock kết quả ra Terminal
    if not SMTP_USER or not SMTP_PASSWORD or SMTP_PASSWORD == "your_app_password_here":
        print(f"\n{'='*70}")
        print(f"📧 [MOCK EMAIL] TO: {to_email}")
        print(f"📌 SUBJECT: {subject}")
        print(f"🗒️  CONTENT (HTML):\n\n{html_content}")
        print(f"{'='*70}\n")
        return

    try:
        msg = MIMEMultipart()
        msg['From'] = f"{SMTP_FROM_NAME} <{SMTP_USER}>"
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(html_content, 'html'))

        # Kết nối tới Server SMTP với STARTTLS
        context = ssl.create_default_context()
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls(context=context)
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
            
        print(f"✅ Đã gửi email thành công tới {to_email}")
    except Exception as e:
        print(f"❌ Lỗi gửi email tới {to_email}: {e}")

def send_reset_password_email(to_email: str, otp_code: str):
    """Gửi email chứa mã OTP khôi phục mật khẩu."""
    subject = "[Vua Linh Kiện] Mã OTP Đặt lại Mật Khẩu"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #f97316; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">VUA LINH KIỆN</h1>
        </div>
        <div style="padding: 40px 30px; background-color: #ffffff; text-align: center;">
            <h2 style="color: #1e293b; margin-top: 0;">Khôi phục mật khẩu tài khoản</h2>
            <p style="color: #475569; line-height: 1.6; text-align: left;">Chào bạn,</p>
            <p style="color: #475569; line-height: 1.6; text-align: left;">Chúng tôi nhận được yêu cầu lấy lại mật khẩu cho tài khoản liên kết với địa chỉ email này. Vui lòng sử dụng mã OTP dưới đây để hoàn tất việc thiết lập mật khẩu mới (Mã có hiệu lực trong 15 phút).</p>
            
            <div style="margin: 40px auto; padding: 20px; background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; display: inline-block;">
                <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #f97316;">{otp_code}</span>
            </div>
            
            <p style="color: #475569; line-height: 1.6; text-align: left;">Nếu bạn không yêu cầu điều này, xin vui lòng bỏ qua email. Tài khoản của bạn vẫn được bảo mật an toàn và không ai có thể truy cập được nếu không có mã này.</p>
        </div>
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; 2026 Hệ thống Vua Linh Kiện. All rights reserved.</p>
        </div>
    </div>
    """
    send_email(to_email, subject, html)

def send_order_confirmation(to_email: str, order_id: int, total_amount: float, shipping_address: str):
    """Gửi Hóa đơn điện tử khi đặt hàng thành công."""
    subject = f"[Vua Linh Kiện] Xác nhận Đơn Hàng #{str(order_id).zfill(4)}"
    
    formatted_total = "{:,.0f}".format(total_amount).replace(",", ".") + " ₫"

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #10b981; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">ĐẶT HÀNG THÀNH CÔNG 🎉</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #1e293b; margin-top: 0;">Cảm ơn bạn đã tin tưởng Vua Linh Kiện!</h2>
            <p style="color: #475569; line-height: 1.6;">Đơn hàng của bạn đã được ghi nhận và đang trực chờ xử lý. Dưới đây là thông tin tóm tắt về hóa đơn điện tử:</p>
            
            <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <p style="margin: 0 0 10px 0;"><strong style="color: #334155;">Mã đơn hàng:</strong> <span style="color: #f97316; font-weight: bold;">#{str(order_id).zfill(4)}</span></p>
                <p style="margin: 0 0 10px 0;"><strong style="color: #334155;">Giá trị đơn:</strong> <span style="color: #10b981; font-weight: bold; font-size: 18px;">{formatted_total}</span></p>
                <p style="margin: 0 0 10px 0;"><strong style="color: #334155;">Giao tới:</strong> {shipping_address}</p>
                <p style="margin: 0;"><strong style="color: #334155;">Hình thức thanh toán:</strong> COD (Thanh toán khi nhận hàng)</p>
            </div>
            
            <p style="color: #475569; line-height: 1.6;">Để theo dõi chi tiết tình trạng di chuyển của bưu kiện, bạn có thể kiểm tra ở danh mục lịch sử đơn hàng của bạn trên hệ thống.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:5173/profile" style="display: inline-block; padding: 14px 30px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">VÀO TRANG QUẢN LÝ ĐƠN</a>
            </div>
        </div>
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">Nếu cần hỗ trợ, vui lòng trả lời trực tiếp email này.</p>
        </div>
    </div>
    """
    send_email(to_email, subject, html)
