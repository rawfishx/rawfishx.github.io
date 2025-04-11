import requests
import time
import json, os
from colorama import init, Fore, Style, Back

# Inisialisasi Colorama
init(autoreset=True)

# Ambil IP pengguna
try:
    ip = requests.get("https://api.ipify.org").text
except requests.RequestException:
    ip = "Tidak dapat mengambil IP"

# Konfigurasi API Visitor
API_VISITOR = "https://api.api-ninjas.com/v1/counter?id=test_id&hit=true"
KEY_VISITOR = "RFj75+sjo1hyWyBRuAkZhQ==d67tIuLmR53MDfjE"

try:
    visitor = requests.get(API_VISITOR, headers={"X-Api-Key": KEY_VISITOR}).json()
except requests.RequestException:
    visitor = {"count": "Tidak tersedia"}

# Waktu lokal
localtime = time.asctime(time.localtime(time.time()))

def banner():
    os.system("clear")
    print(f"""{Style.BRIGHT}
⠀⠀⠀⠀⠀⠀⢀⣴⣾⣿⣷⣶⠶⣢⣤⢤⣤⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠸⣿⣿⣿⣏⠉⢺⣿⣿⣯⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢹⣿⡋⠿⣅⣢⡽⢿⣞⣟⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⣠⢭⣒⣫⠛⡙⡚⠈⠟⠁⢹⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠴⠊⠸⡍⠁⡀⡀⠁⠀⠄⠀⠶⡾⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢒⡂⢀⢠⣶⣦⣷⣋⡇⣤⣤⡀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⣀⣀⣀⣀⣀⣀⣸⢸⣿⣿⢡⣧⣼⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢸⠭⠉⠉⠀⠈⡀⡘⢸⡿⣳⡍⣏⣾⣿⣿⣷⣠⣤⣀⣀⠀⠀⠀
⠀⠀⢠⠤⠤⠄⣸⣿⣤⣼⣼⣿⣿⣿⣿⢇⠛⣃⣿⣿⣯⣾⣿⣿⣿⣿⣿⣷⡄⠀
⠀⠀⣸⠀⢀⡶⣖⣻⡿⢿⣿⣿⣿⡟⡃⠙⣏⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄
⠀⢀⠛⠠⢪⠊⡵⢈⢐⣿⣿⣿⣿⢃⣉⣵⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇
⠀⢸⡄⢰⠃⠀⠉⢠⣽⣿⣿⣿⣧⣛⣣⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠃
⠀⣸⠁⣆⣀⣤⣤⣶⣿⣿⣿⣿⣿⣿⣿⣿⣟⣋⣉⣀⣽⣿⣿⣿⣿⣿⣿⡿⣫⡀
⢀⡟⡀⢿⠿⠻⣿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡾⣿⣿⣿⢿⣫⣾⣿⠧
⢾⠃⠁⡇⠀⢰⣇⣘⣿⣿⣿⣿⣿⣿⣿⡷⠶⠶⠦⠬⠍⠓⠈⠘⠂⠉⠉⠁⠀⠀⠀
CREATED BY {Fore.RED}XIORZ
                            """)

def get_ip_info(ip):
    """Mengambil informasi IP dari API"""
    url = f"https://ipapi.co/{ip}/json/"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"{Fore.RED}Error: {e}")
        return None

def display_ip_info(data):
    """Menampilkan informasi IP dengan warna"""
    if not data:
        print(f"{Fore.RED}Tidak ada data yang dapat ditampilkan.")
        return
    
    print(f"{Fore.BLUE}{Style.BRIGHT}IP: {Fore.RED}{data.get('ip', 'Tidak tersedia')}")
    print(f"{Fore.GREEN}{Style.BRIGHT}Version: {Fore.YELLOW}{data.get('version', 'Tidak tersedia')}")
    print(f"{Fore.RED}{Back.WHITE}{Style.BRIGHT}City: {Fore.WHITE}{Back.RED}{data.get('city', 'Tidak tersedia')}")
    print(f"{Style.BRIGHT}{Fore.BLACK}Region: {Back.WHITE}{data.get('region', 'Tidak tersedia')}")
    print(f"Region Code: {data.get('region_code', 'Tidak tersedia')}")
    print(f"Country Code: {data.get('country_code', 'Tidak tersedia')}")
    print(f"Country Name: {data.get('country_name', 'Tidak tersedia')}")
    print(f"Latitude: {data.get('latitude', 'Tidak tersedia')}")
    print(f"Longitude: {data.get('longitude', 'Tidak tersedia')}")
    print(f"Timezone: {data.get('timezone', 'Tidak tersedia')}")
    print(f"Currency: {data.get('currency', 'Tidak tersedia')}")
    print(f"ASN: {data.get('asn', 'Tidak tersedia')}")
    print(f"Organization: {data.get('org', 'Tidak tersedia')}")
    print(f"{Fore.BLACK}{Back.YELLOW}Hostname: {data.get('hostname', 'Tidak tersedia')}")

def about():
    """Menampilkan informasi tentang pembuat dan waktu saat ini"""
    print(f"{Style.BRIGHT}{Fore.RED}Your {Fore.GREEN}IP  {Fore.WHITE}: {Fore.YELLOW}{ip} {Fore.BLUE}| {Fore.MAGENTA} Time{Fore.BLACK}: {Fore.CYAN}{localtime}")

if __name__ == "__main__":
    banner()
    about()
    
    # Input IP
    user_ip = input(f"{Fore.MAGENTA}Enter the IP address (kosong = IP sendiri): ").strip()
    if not user_ip:
        user_ip = ip  # Pakai IP default jika input kosong
    
    ip_info = get_ip_info(user_ip)
    display_ip_info(ip_info)