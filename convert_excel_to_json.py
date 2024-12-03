import pandas as pd

# Đọc tệp Excel (thay 'filename.xlsx' bằng tên tệp của bạn)
excel_file = 'DATA.xlsx'

# Đọc dữ liệu từ Excel
df = pd.read_excel(excel_file)

# Chuyển đổi dữ liệu sang định dạng JSON
json_data = df.to_json(orient='records', indent=4)

# Lưu kết quả vào một tệp JSON (thay 'output.json' bằng tên tệp bạn muốn)
with open('output.json', 'w') as json_file:
    json_file.write(json_data)

print("Chuyển đổi thành công! Tệp JSON đã được lưu với tên 'output.json'.")
