## Nuxt and Node Streaming Application


## Setup Node Server
``` bash
cd backend
yarn install
yarn start
```

## Setup Nuxt Application
``` bash
cd frontend
yarn install
yarn dev
```

**Note**: this application use hls library to control media player 

**Vấn đề**: có 1 danh sách videos, tạo trang web cho phép xem các video tuần tự, với điều kiện video tiếp theo khi được xem thì sẽ không cần chờ để load, memorize và caching video

**Phương pháp**: 
+ **Cách 1 (Server):** Có thể sử dụng cơ chế response pipe để trả về client video dạng stream ```(trả về tài nguyên liên tục trên 1 response đến khi kết thúc)```, sử dụng header với range với có thể lấy dữ liệu từ byte thứ bao nhiêu đến byte thứ bao nhiêu.
+ **Cách 2 (Server):**  Trả về client các phân đoạn của tài nguyên ```(Tài nguyên được phân tách thành nhiều phần nhỏ, trong project này sử dụng ffmpeg để tách video thành nhiều phân đoạn file .ts, và 1 file .m3u8 chứa thông tin của các phân đoạn)```, mỗi phân đoạn là 1 response, khi này phía Client handle từ endpoint này và phát liên tục các chunk đã thu về.
+ **FrontEnd (Client)**: Mặc định trình duyệt của chúng ta có cơ chế cache lại các tài nguyên đã được load từ trước ```(có thể tắt tính nằng này trong tab network devtools)```

**Giải quyết**
+ Phía BackEnd sử cắt video thành nhiều phân đoạn ```(file .ts)``` và trả cho client file ```.m3u8``` để có thể lấy được thông tin các phân đoạn ```(thư mục chứa các phân đoạn cần được static hoặc được response qua api)```.
+ Phía FrontEnd 
   * Sử dụng thư viện HLS để quản lý trình phát video từ 1 file ```.m3u8``` để xử lý việc phát video stream
   * Sử lý logic khi video hiện tại được phát, thực hiện tạo trình phát video, cho video trước và sau video hiện tại, thực hiện load phân cảnh đầu tiên ```(khi video tiếp được lựa chọn phát, trình duyệt nhận thấy phân cảnh đầu tiên của video đã được load từ trước, nó sẽ lấy từ trong cache ra và phát ngay lập tức, các phân cảnh tiếp theo sẽ được tiếp tục load)```

