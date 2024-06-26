import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate    } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { XoaTatCaSP } from "../../redux/cartSlice";
import { message } from "antd";

// Kiểm tra định dạng email hợp lệ
const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  return emailRegex.test(email);
};

// Kiểm tra số điện thoại Việt Nam hợp lệ
const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^(03|05|07|08|09)\d{8}$/; // Số điện thoại Việt Nam hợp lệ
  return phoneRegex.test(phone);
};

function ThanhToan() {
  const dispatch = useDispatch();
  const navigate = useNavigate ();
  const cart = useSelector((state) => state.cart.listSP);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD'); // Khởi tạo giá trị mặc định là COD
  const user = useSelector((state) => state.auth.user);
  const [email, setEmail] = useState(user ? user.email : '');
  const [hoTen, setHoTen] = useState(user ? user.ho_ten : '');
  const [soDienThoai, setSoDienThoai] = useState(user ? user.sdt : '');
  const [diaChi, setDiaChi] = useState(user ? user.diachi : '');
  const [voucherCode, setVoucherCode] = useState(""); 
  const [discountPercent, setDiscountPercent] = useState(0);
  const [idGiamGia, setIdGiamGia] = useState(null);
  const emailRef = useRef(null);
  const hotenRef = useRef(null);
  const sdtRef = useRef(null);
  const diachiRef = useRef(null);
  const ghichuRef = useRef(null);
  const tinhRef = useRef(null);
  const huyenRef = useRef(null);
  const xaRef = useRef(null);

  const calculateTotal = () => {
    let total = 0;
    cart.forEach((product) => {
      // Nếu có giá khuyến mãi và giá khuyến mãi khác 0, tính giá sau khi áp dụng phần trăm giảm giá
      if (product.gia_khuyenmai && product.gia_khuyenmai !== 0) {
        total += (product.gia_khuyenmai * (100 - discountPercent) / 100) * product.soluong;
      } else {
        // Nếu không có giá khuyến mãi, tính giá gốc
        total += product.gia * product.soluong;
      }
    });
    return total;
  };
  

  const applyVoucher = () => {
    // Kiểm tra nếu người dùng không phải là thành viên
    if (!user || !user.id_user) {
      message.warning("Bạn không phải là thành viên. Vui lòng đăng nhập để sử dụng mã giảm giá.");
      return; // Dừng lại nếu người dùng không phải là thành viên
    }
  
    fetch(`https://api.sqbe.store/voucher`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const matchedVoucher = data.find((voucher) => voucher.ma_giamgia === voucherCode);
        if (matchedVoucher) {
          if (matchedVoucher.trang_thai === 2 || matchedVoucher.tinh_trang === 2) {
            message.warning("Mã giảm giá đã được sử dụng hoặc không hoạt động");
          } else {
            setDiscountPercent(matchedVoucher.phan_tram);
            setIdGiamGia(matchedVoucher.id_giamgia);
            message.success("Áp dụng mã giảm giá thành công");
          }
        } else {
          setDiscountPercent("");
          message.error("Không tìm thấy mã giảm giá phù hợp");
        }
      })
      .catch((error) => {
        console.error("Lỗi khi gọi API:", error);
        message.error("Đã xảy ra lỗi, vui lòng thử lại sau");
      });
  };
  
  
  useEffect(() => {
    fetch("https://api.sqbe.store/donhang/data")
      .then((response) => response.json())
      .then((data) => {
        setProvinces(data);
        setLoadingProvinces(false);
        setLoadingDistricts(false);
        setLoadingWards(false);
      })
      .catch((error) => {
        console.error("Lỗi khi tải dữ liệu tỉnh thành:", error);
        setLoadingProvinces(false);
        setLoadingDistricts(false);
        setLoadingWards(false);
      });
  }, []);

  const handleProvinceChange = (e) => {
    const selectedProvince = e.target.value;
    const selectedProvinceData = provinces.find(
      (province) => province[1] === selectedProvince
    );

    if (selectedProvinceData && selectedProvinceData.length > 4) {
      setDistricts(selectedProvinceData[4]);
    } else {
      setDistricts([]);
    }
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    const selectedDistrictData = districts.find(
      (district) => district[1] === selectedDistrict
    );

    if (selectedDistrictData && selectedDistrictData.length > 4) {
      setWards(selectedDistrictData[4]);
    } else {
      setWards([]);
    }
  };

  const submitData = () => {
    // Kiểm tra nếu giỏ hàng trống
    if (cart.length === 0) {
      message.error("Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng.");
      return;
    }
  
    // Lấy giá trị của các trường từ các ref
    const emailValue = emailRef.current.value;
    const hotenValue = hotenRef.current.value;
    const sdtValue = sdtRef.current.value;
    const diachiValue = diachiRef.current.value;
    const tinhValue = tinhRef.current.value;
    const huyenValue = huyenRef.current.value;
    const xaValue = xaRef.current.value;
    const ghichuValue = ghichuRef.current.value;
  
    // Kiểm tra các trường bắt buộc
    if (!emailValue || !hotenValue || !sdtValue || !diachiValue || !tinhValue || !huyenValue || !xaValue) {
      message.error("Vui lòng nhập đầy đủ thông tin trước khi đặt hàng.");
      return; // Không tiếp tục gửi dữ liệu
    }
 // Kiểm tra tính hợp lệ của email và số điện thoại
 if (!isValidEmail(emailValue)) {
  message.error("Email không hợp lệ. Vui lòng kiểm tra lại.");
  return;
}

if (!isValidPhoneNumber(sdtValue)) {
  message.error("Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam.");
  return;
}
const user = {
  id_user: null, // Có thể là giá trị null nếu người dùng chưa đăng nhập
  // Các thuộc tính khác của người dùng
};
  
    // Tạo object chứa thông tin đơn hàng
    const orderData = {
      email: emailValue,
      hoten: hotenValue,
      sdt: sdtValue,
      diachi: diachiValue,
      tinh: tinhValue,
      huyen: huyenValue,
      xa: xaValue,
      ghi_chu: ghichuValue, // Ghi chú không bắt buộc
      total: calculateTotal(),
      id_user: user.id_user ?? null,
      id_giamgia: idGiamGia,
    };
  
    // Gửi dữ liệu đơn hàng đến backend
    fetch("https://api.sqbe.store/donhang/luudonhang", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        message.success("Lưu đơn hàng thành công");
        const id_donhang = data.id_donhang; // Lấy id_donhang từ phản hồi
        luuchitietdonhang(id_donhang); // Gọi hàm để lưu chi tiết đơn hàng
        dispatch(XoaTatCaSP()); // Xóa giỏ hàng sau khi lưu thành công
  
        // Điều hướng tùy thuộc vào phương thức thanh toán
        if (paymentMethod === 'VNPAY-QR') {
          createPaymentUrl(id_donhang, calculateTotal());
        } else {
          navigate(`/thanhtoanthanhcong/${id_donhang}`);
        }
      })
      .catch((error) => {
        console.error("Error submitting order:", error);
        message.error("Lưu đơn hàng thất bại"); // Hiển thị thông báo lỗi
      });
  };
  const luuchitietdonhang = (id_donhang) => {
    // Lặp qua từng sản phẩm trong giỏ hàng để lưu chi tiết đơn hàng
    
    cart.forEach((product) => {
      const gia = product.gia_khuyenmai ? product.gia_khuyenmai : product.gia;
      const chiTietDonHangData = {
        id_donhang: id_donhang,
        id_chitietsp: product.id_chitietsp,
        id_size: product.id_size,
        ten_sanpham:product.ten_sanpham,
        so_luong: product.soluong,
        gia_ban: gia,
      };

      // Gửi dữ liệu chi tiết đơn hàng đến backend
      fetch("https://api.sqbe.store/donhang/luuchitietdonhang", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chiTietDonHangData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Chi tiết đơn hàng submitted successfully:", data);
          // Xử lý phản hồi thành công từ máy chủ (nếu cần)
        })
        .catch((error) => {
          console.error("Error submitting order detail:", error);
          // Xử lý lỗi (nếu cần)
        });
    });
  };

  const createPaymentUrl = (id_donhang, total) => {
    // Gửi dữ liệu đơn hàng đến backend
    fetch("https://api.sqbe.store/payment/create_payment_url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: id_donhang, // Chuyển id_donhang thành orderId
        amount: total, // Chuyển total thành amount
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text(); // Trả về response dưới dạng văn bản
      })
      .then((vnpUrl) => {
        // Chuyển hướng trình duyệt đến trang thanh toán
        window.location.href = vnpUrl;
      })
      .catch((error) => {
        console.error("Error creating payment URL:", error);
        // Xử lý lỗi
      });
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  return (
    <div className="container-thanhtoan">
      <article>
        
        <div className="content-article">
          <div className="content-left">
            <div className="logo-content">
              <Link to="/">
              
                <img src="./images/SQBE Logo-black.png" alt="" />
              </Link>
            </div>
         

        
            <form>
            <div className="aside__top_mb">
          <h2>Đơn hàng ({cart.length} sản phẩm)</h2>
          </div>
              <h1>Thông tin nhận hàng</h1>
              <div className="input-container">
              <input
              type="text"
              ref={emailRef}
              className="input-field"
              value={email || ''}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
                <label htmlFor="email" className="input-label">
                  Email
                </label>
              </div>
              <div className="input-container">
              <input
              type="text"
              ref={hotenRef}
              value={hoTen || ''}
              className="input-field"
              onChange={(event) => setHoTen(event.target.value)}
              required
            />
                <label htmlFor="hoten" className="input-label">
                  Họ và tên
                </label>
              </div>
              <div className="input-container">
              <input
                type="text"
                ref={sdtRef}
                value={soDienThoai || ''}
                className="input-field"
                onChange={(event) => setSoDienThoai(event.target.value)}
                required
              />
                <label htmlFor="sdt" className="input-label">
                  Số điện thoại
                </label>
              </div>
              <div className="input-container">
              <input
                type="text"
                ref={diachiRef}
                value={diaChi || ''}
                className="input-field"
                onChange={(event) => setDiaChi(event.target.value)}
                required
              />
              <label htmlFor="diachi" className="input-label">
                Địa chỉ
              </label>
            </div>
              <div className="input-container">
  <select
    id="province"
    className="input-field"
    onChange={handleProvinceChange}
    required
    ref={tinhRef}
  >
    {loadingProvinces ? (
      <option>Đang tải...</option>
    ) : (
      <>
        {user && user.tinh && (
          <option value={user.tinh} selected>
            {user.tinh}
          </option>
        )}
        <option value="" disabled={user && !!user.tinh}>
          {user && user.tinh ? '' : ''}
        </option>
        {provinces.map((province) => (
          <option key={province[0]} value={province[1]}>
            {province[1]}
          </option>
        ))}
      </>
    )}
  </select>
  <label htmlFor="province" className="input-label">
    Chọn tỉnh thành
  </label>
</div>

<div className="input-container">
  <select
    id="district"
    className="input-field"
    onChange={handleDistrictChange}
    required
    ref={huyenRef}
  >
    {loadingDistricts ? (
      <option>Đang tải...</option>
    ) : (
      <>
        {user && user.huyen && (
          <option value={user.huyen} selected>
            {user.huyen}
          </option>
        )}
        <option value="" disabled={user && !!user.huyen}>
          {user && user.huyen ? '' : ''}
        </option>
        {districts.map((district) => (
          <option key={district[0]} value={district[1]}>
            {district[1]}
          </option>
        ))}
      </>
    )}
  </select>
  <label htmlFor="district" className="input-label">
    Chọn quận huyện
  </label>
</div>

<div className="input-container">
  <select
    id="ward"
    className="input-field"
    required
    ref={xaRef}
  >
    {loadingWards ? (
      <option>Đang tải...</option>
    ) : (
      <>
        {user && user.xa && (
          <option value={user.xa} selected>
            {user.xa}
          </option>
        )}
        <option value="" disabled={user && !!user.xa}>
          {user && user.xa ? '' : ''}
        </option>
        {wards.map((ward) => (
          <option key={ward[0]} value={ward[1]}>
            {ward[1]}
          </option>
        ))}
      </>
    )}
  </select>
  <label htmlFor="ward" className="input-label">
    Chọn xã, phường
  </label>
</div>


              <div className="input-container">
                <textarea
                  type="text"
                  ref={ghichuRef}
                  className="textarea-field"
                  required
                />
                <label htmlFor="ghichu" className="input-label">
                  Ghi chú
                </label>
              </div>
            </form>
          </div>
          <div className="content-right">
            <div className="container-box">
              <div className="box-vanchuyen">
                <h1>Vận chuyển</h1>
                <div className="box-title">
                  Vui lòng nhập thông tin giao hàng
                </div>
              </div>
              <div className="box-thanhtoan">
                <h1>Thanh toán</h1>
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <input type="radio" name="payment_method" value="VNPAY-QR" onChange={handlePaymentMethodChange} />
                        Thanh toán qua VNPAY-QR
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <input
                          type="radio"
                          name="payment_method"
                          defaultChecked
                        />
                        Thanh toán khi giao hàng (COD)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mb-voucher">
        <div id="left">
        <input
        type="text"
        placeholder="Nhập mã giảm giá"
        value={voucherCode}
        onChange={(e) => setVoucherCode(e.target.value)}
      />
        </div>
        <div id='right'>
         <button onClick={applyVoucher}>Áp dụng</button>
        </div>
      </div>
              <span id='mb-total'>
                      {calculateTotal().toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </span>
              <div className='dathang-mb' onClick={submitData}> Đặt HÀNG </div>
              <Link to='/viewcart' className="return-cart">  Quay về giỏ hàng</Link>
            </div>
            
          </div>
          
        </div>
      
      </article>
      <aside>
        <div className="aside-content">
          <div className="aside__top">
          <h1>Đơn hàng ({cart.length} sản phẩm)</h1>
          </div>
          <div className="aside__cart">
            {cart.map((product, index) => (
              <table key={index}>
                <tbody>
                  <tr>
                  <td id="img" rowSpan="3">
  <img
    src={`https://api.sqbe.store/chitietsanpham/${product.hinh_anh_1}`}
    alt={product.ten_sanpham}
  />
  <span id="count">{product.soluong}</span>
</td>

                    <td id="name">{product.ten_sanpham}</td>
                  
                  </tr>
                  <tr>
                  <td id="price">
      {product.gia_khuyenmai !== null && product.gia_khuyenmai < product.gia ? (
        <>
          <del>{formatPrice(product.gia * product.soluong)}</del> {formatPrice(product.gia_khuyenmai * product.soluong)}
        </>
      ) : (
        formatPrice(product.gia * product.soluong)
      )}
    </td>
                  </tr>
                  <tr>
                    <td id="size">Size:{product.ten_size}</td>
                  </tr>
                </tbody>
              </table>
            ))}
          </div>

          <div className="aside__discount">
            <table>
              <tbody>
                <tr>
                  <td>
                  <input
        type="text"
        placeholder="Nhập mã giảm giá"
        value={voucherCode}
        onChange={(e) => setVoucherCode(e.target.value)}
      />
                  </td>
                  <td>
                  <button onClick={applyVoucher}>Áp dụng</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="aside__total">
            <table>
              <tbody>
              <tr>
                
                <td id="total__text">Giảm gíá</td>
                <td id="total__price">
    <span>{discountPercent}%</span>
  </td>
              </tr>
                <tr>

                  <td id="total__text">Tổng Cộng</td>
                  <td id="total__price">
                    <span>
                      {calculateTotal().toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td id="total__back">
                    <Link id='link'to="/viewcart">quay về giỏ hàng </Link>
                  </td>
                  <td id="total__dathang">
                    <button onClick={submitData}>Đặt hàng</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default ThanhToan;
