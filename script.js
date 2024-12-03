document.addEventListener('DOMContentLoaded', () => {
    let data = [];

    // Tải dữ liệu từ file data.json
    fetch('data/data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(json => {
            data = json;
            console.log('Data loaded:', data); // Ghi lại dữ liệu đã tải
        })
        .catch(error => console.error('Error loading data:', error));

    const suburbInput = document.getElementById('suburb-input');
    const runInput = document.getElementById('run-input'); // Trường nhập liệu Run Number
    const suggestions = document.getElementById('suggestions');
    const runSuggestions = document.getElementById('run-suggestions');
    const result = document.getElementById('result');
    const runResult = document.getElementById('run-result');
    const runInfo = document.getElementById('run-info'); // Phần chứa Run Number và Zone
    const suburbName = document.getElementById('suburb');
    const zone = document.getElementById('zone');
    const run = document.getElementById('run');
    const postcode = document.getElementById('postcode');
    const formattedResult = document.getElementById('formatted-result');
    const zoneFromRun = document.getElementById('zone-from-run');
    const runFromRun = document.getElementById('run-from-run');

    // Mặc định ẩn phần hiển thị Run Number và Zone
    runInfo.style.display = 'none';

    // Tab navigation logic
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Xóa class 'active' khỏi tất cả các tab và nội dung
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Thêm class 'active' vào tab được nhấp và hiển thị nội dung tương ứng
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Hàm loại bỏ trùng lặp dựa trên Run Number
    function removeRunDuplicates(arr) {
        const seen = new Set();
        return arr.filter(item => {
            const val = item.Run.toString(); // Chuyển thành chuỗi để đảm bảo không bị nhầm lẫn
            if (seen.has(val)) {
                return false; // Nếu Run Number đã tồn tại, bỏ qua
            }
            seen.add(val); // Thêm Run Number vào Set
            return true; // Giữ lại các Run Number chưa có trong Set
        });
    }

    // Lắng nghe sự kiện khi người dùng nhập vào input Suburb
    suburbInput.addEventListener('input', function() {
        const input = suburbInput.value.toLowerCase();
        suggestions.innerHTML = '';

        if (input.length === 0) {
            suggestions.style.display = 'none';
            result.style.display = 'none';
            return;
        }

        // Lọc và sắp xếp theo bảng chữ cái
        let matchedSuburbs = data.filter(item => 
            item.Suburb.toLowerCase().startsWith(input) || 
            (item.Postcode && item.Postcode.toString().startsWith(input))
        );

        matchedSuburbs.sort((a, b) => a.Suburb.localeCompare(b.Suburb)); // Sắp xếp theo bảng chữ cái

        if (matchedSuburbs.length === 0) {
            suggestions.style.display = 'block';
            const noResult = document.createElement('div');
            noResult.innerHTML = `
                No suburb matched. Note:
                <br>GOS postcode: 2250 to 2263
                <br>NTL postcode: 2264 to 2327
                <br>WOL postcode: 2500 to 2533
            `;
            suggestions.appendChild(noResult);
        } else {
            suggestions.style.display = 'block';
            matchedSuburbs.forEach(suburbItem => {
                const suggestion = document.createElement('div');
                suggestion.textContent = `${suburbItem.Suburb} (${suburbItem.Postcode})`;
                suggestion.addEventListener('click', () => {
                    suburbInput.value = '';
                    suburbName.textContent = suburbItem.Suburb;
                    zone.textContent = suburbItem.Zone;
                    run.textContent = suburbItem.Run;
                    postcode.textContent = suburbItem.Postcode;

                    let formattedRun = suburbItem.Run.toString().padStart(3, '0'); // Đảm bảo Run luôn có 3 chữ số
                    formattedResult.innerText = `(SZ${suburbItem.Zone}${formattedRun})`;

                    result.style.display = 'block';
                    suggestions.innerHTML = '';
                    suggestions.style.display = 'none';
                });
                suggestions.appendChild(suggestion);
            });
        }
    });

    // Lắng nghe sự kiện khi người dùng nhập vào input Run Number
    runInput.addEventListener('input', function() {
        const inputRun = runInput.value.toLowerCase();
        runSuggestions.innerHTML = '';

        if (inputRun.length === 0) {
            runSuggestions.style.display = 'none';
            runInfo.style.display = 'none'; // Ẩn khi không có input
            return;
        }

        // Lọc dữ liệu dựa trên Run Number và loại bỏ trùng lặp
        let matchedRuns = data.filter(item => item.Run.toString().startsWith(inputRun));

        matchedRuns = removeRunDuplicates(matchedRuns); // Loại bỏ trùng lặp theo Run Number

        matchedRuns.sort((a, b) => a.Run - b.Run); // Sắp xếp theo thứ tự số từ nhỏ đến lớn

        if (matchedRuns.length === 0) {
            runSuggestions.style.display = 'block';
            const noRunResult = document.createElement('div');
            noRunResult.innerHTML = `No Run Number matched.`;
            runSuggestions.appendChild(noRunResult);
        } else {
            runSuggestions.style.display = 'block';
            matchedRuns.forEach(runItem => {
                const runSuggestion = document.createElement('div');
                runSuggestion.textContent = `Run ${runItem.Run} (Zone ${runItem.Zone})`;
                runSuggestion.addEventListener('click', () => {
                    runInput.value = '';

                    // Hiển thị kết quả khi người dùng chọn
                    runFromRun.textContent = runItem.Run;
                    zoneFromRun.textContent = runItem.Zone;
                    runInfo.style.display = 'block'; // Hiển thị phần Run Number và Zone

                    runSuggestions.innerHTML = '';
                    runSuggestions.style.display = 'none';
                });
                runSuggestions.appendChild(runSuggestion);
            });
        }
    });

    // Sự kiện click cho logo, tải lại file index.html
    const logoLink = document.getElementById('logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = 'index.html'; // Điều hướng tới file index.html
        });
    }
});
