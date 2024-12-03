document.addEventListener('DOMContentLoaded', function () {
  const startButton = document.getElementById('startAutomation');
  const barcodeInput = document.getElementById('barcode');

  // Hàm để bắt đầu quá trình tự động hóa
  function startAutomation() {
    const barcode = barcodeInput.value.trim();  // Lấy giá trị barcode từ người dùng

    // Gửi tin nhắn đến trang hiện tại để thực hiện tự động hóa với giá trị barcode đã nhập
    if (barcode) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: automateTask,
          args: [barcode]  // Truyền barcode tới trang hiện tại
        });
      });

      // Xóa nội dung ô nhập liệu sau khi nhấn nút Start Automation
      barcodeInput.value = '';  // Clear nội dung ô nhập liệu
      barcodeInput.focus();     // Đưa con trỏ chuột về lại ô nhập liệu trên extension
      console.log("Đã clear nội dung ô nhập liệu và đưa con trỏ về ô nhập liệu trên extension.");
    }
  }

  // Lắng nghe sự kiện click vào nút Start Automation
  startButton.addEventListener('click', startAutomation);

  // Lắng nghe sự kiện nhấn phím Enter từ ô nhập liệu barcode
  barcodeInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {  // Kiểm tra nếu phím Enter được nhấn
      event.preventDefault();     // Ngăn không để form submit mặc định
      startAutomation();          // Gọi hàm startAutomation để bắt đầu
    }
  });
});

// Hàm này sẽ được thực thi trong context của trang web
function automateTask(barcode) {
  console.log("Đang tự động hóa với barcode: ", barcode);

  // Tìm ô nhập liệu với ID "order-lookup" và nhập barcode
  let inputField = document.getElementById("order-lookup");
  if (!inputField) {
    alert("Không tìm thấy ô nhập liệu. Vui lòng kiểm tra ID.");
    return;
  }

  // Nhập barcode vào ô nhập liệu
  inputField.value = barcode;

  // Giả lập sự kiện để hiển thị danh sách gợi ý
  let event = new Event('input', { bubbles: true });
  inputField.dispatchEvent(event);

  // Biến theo dõi thời gian chờ và thời gian tối đa là 5 giây (5000ms)
  let elapsedTime = 0;
  const maxWaitTime = 5000;

  // Sử dụng setInterval để kiểm tra sự xuất hiện của phần tử gợi ý
  const checkSuggestionInterval = setInterval(() => {
    let firstSuggestion = document.querySelector('.ui-menu-item.ui-state-focus');
    
    if (firstSuggestion) {
      console.log("Đã tìm thấy kết quả gợi ý đầu tiên với class 'ui-menu-item ui-state-focus':", firstSuggestion);
      
      // Click trực tiếp vào phần tử gợi ý đầu tiên
      firstSuggestion.click();
      console.log("Đã click vào kết quả gợi ý đầu tiên.");
      
      // Sau khi click, dừng kiểm tra
      clearInterval(checkSuggestionInterval);

      // Tiếp tục kiểm tra các trường nhập liệu có dữ liệu hay chưa
      let inputFieldsElapsedTime = 0;
      const checkInputFieldsInterval = setInterval(() => {
        let lengthInput = document.querySelector('input[title="Length"]');
        let widthInput = document.querySelector('input[title="Width"]');
        let heightInput = document.querySelector('input[title="Height"]');
        let weightInput = document.querySelector('input[title="Weight"]');
        let suburbInput = document.querySelector('input[title="Suburb/Town"]');

        // Kiểm tra nếu tất cả các trường đều có dữ liệu
        if (lengthInput && lengthInput.value && widthInput && widthInput.value &&
            heightInput && heightInput.value && weightInput && weightInput.value &&
            suburbInput && suburbInput.value) {
          console.log("Tất cả các trường 'Length', 'Width', 'Height', 'Weight', và 'Suburb/Town' đã có giá trị.");
          
          // Sau khi tất cả các ô đã có dữ liệu, dừng kiểm tra
          clearInterval(checkInputFieldsInterval);

          // Thực hiện các thao tác tiếp theo như click vào checkbox và nhấn Save
          let formElement = document.getElementById("senderReceiverInputForm");
          if (formElement) {
            let declareCheckbox = formElement.querySelector('#noDGs');
            if (declareCheckbox && !declareCheckbox.checked) {
              declareCheckbox.click();  // Click vào checkbox để đánh dấu
              console.log("Đã tích vào checkbox 'I declare no DGs'.");
            } else {
              console.log("Không tìm thấy checkbox 'noDGs' hoặc nó đã được tích.");
            }
          } else {
            console.log("Không tìm thấy form có ID 'senderReceiverInputForm'.");
          }

          // Nhấn nút Save sau khi đã kiểm tra dữ liệu các trường
          let saveButton = document.getElementById("btnSave");
          if (saveButton) {
            if (saveButton.hasAttribute('disabled')) {
              saveButton.removeAttribute('disabled');  // Loại bỏ thuộc tính "disabled" nếu có
              console.log("Đã loại bỏ thuộc tính 'disabled' của nút Save.");
            }
            saveButton.click();  // Click vào nút Save
            console.log("Đã click vào nút Save.");

            // Sử dụng setInterval để kiểm tra nút Select có xuất hiện chưa
            const checkSelectButtonInterval = setInterval(() => {
              let selectButton = document.getElementById("saveService");
              if (selectButton) {
                console.log("Nút Select đã xuất hiện.");
                selectButton.click();  // Click vào nút Select
                console.log("Đã nhấn nút Select.");

                // Sau khi click, dừng kiểm tra
                clearInterval(checkSelectButtonInterval);

                // Đưa con trỏ chuột quay lại ô nhập liệu
                inputField.focus();
                console.log("Quay lại ô nhập liệu và sẵn sàng cho vòng lặp tiếp theo.");
              } else {
                console.log("Chưa tìm thấy nút Select, tiếp tục kiểm tra...");
              }
            }, 100);  // Kiểm tra mỗi 100ms để tìm nút Select
          } else {
            console.log("Không tìm thấy nút Save với ID 'btnSave'.");
          }
          
        } else {
          // Tăng thời gian chờ
          inputFieldsElapsedTime += 100;

          // Nếu quá 5 giây mà các ô nhập liệu chưa có giá trị, dừng kiểm tra và báo lỗi
          if (inputFieldsElapsedTime >= maxWaitTime) {
            clearInterval(checkInputFieldsInterval);  // Dừng kiểm tra
            alert("Some details missing");  // Hiển thị thông báo
            return;  // Dừng quá trình tự động hóa
          }
          console.log("Đang chờ các ô nhập liệu có dữ liệu...");
        }
      }, 100);  // Kiểm tra mỗi 100ms để xem các trường nhập liệu có dữ liệu chưa

    } else {
      // Tăng thời gian chờ
      elapsedTime += 100;

      // Nếu quá 5 giây mà phần tử chưa xuất hiện, dừng kiểm tra và báo lỗi
      if (elapsedTime >= maxWaitTime) {
        console.log("Quá 5 giây mà không tìm thấy kết quả gợi ý.");
        clearInterval(checkSuggestionInterval);  // Dừng kiểm tra
        alert("No data");  // Hiển thị thông báo
        return;  // Dừng quá trình tự động hóa
      }
      console.log("Chưa tìm thấy kết quả gợi ý, tiếp tục kiểm tra...");
    }
  }, 100);  // Kiểm tra mỗi 100ms để tìm kết quả gợi ý
}
