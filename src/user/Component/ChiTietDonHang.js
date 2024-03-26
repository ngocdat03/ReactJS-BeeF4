import React, { useState, useEffect } from 'react';
import { useParams,Link } from 'react-router-dom';

const ChiTietDonHang = () => {
    const { id_donhang } = useParams();
    const [chitietDonHang, setChiTietDonHang] = useState(null);
    const [donHang, setDonHang] = useState(null);
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return "Chưa cập nhật";
        const vietnamTime = new Date(dateTimeString).toLocaleString("en-US", {
          timeZone: "Asia/Ho_Chi_Minh",
        });
        return vietnamTime;
      };
    
      const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return "Chưa cập nhật";
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                const donhangResponse = await fetch(`http://localhost:4000/donhang/${id_donhang}`);
                const chitietDonhangResponse = await fetch(`http://localhost:4000/donhang/listchitietdonhang/${id_donhang}`);

                if (!donhangResponse.ok || !chitietDonhangResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const donhangData = await donhangResponse.json();
                const chitietDonhangData = await chitietDonhangResponse.json();

                setDonHang(donhangData);
                setChiTietDonHang(chitietDonhangData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [id_donhang]);
    return (
        <div id="container-main">
           <div className="container-chitietdonhang">
              <div className="content">
                <h3>ĐƠN HÀNG #{id_donhang}</h3>
                <div className="box">
                  <div className="box-left">
                  <p className="ngaytao">Ngày tạo - {donHang ? formatDateTime(donHang.ngay_dat) : "Chưa cập nhật"}</p>
                    <h3 className="diachithanhtoan">Địa chỉ thanh toán</h3>
                    <p>Trình trạng thanh toán: Thanh toán 1 phần</p>
                    <p>{donHang && donHang.ho_ten}</p>
                    <p>{donHang && donHang.tinh} - {donHang && donHang.huyen} - {donHang && donHang.xa} - {donHang && donHang.diachi}</p>
                    <p>Việt Nam</p>
                    <p>{donHang && donHang.sdt}</p>
                  </div>
                  <div className="box-right">
                    <h3>Địa chỉ giao hàng</h3>
                    <p>Tình trạng giao hàng: Chưa giao hàng</p>
                    <p>{donHang && donHang.ho_ten}</p>
                    <p>{donHang && donHang.tinh} - {donHang && donHang.huyen} - {donHang && donHang.xa} - {donHang && donHang.diachi}</p>
                    <p>Việt Nam</p>
                    <p>{donHang && donHang.sdt}</p>
                  </div>
                </div>
                <table className="table">
    <thead>
        <tr>
            <th>Sản phẩm</th>
            <th>SKU</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th>Tổng</th>
        </tr>
    </thead>
    <tbody>
        {chitietDonHang && chitietDonHang.map((product, index) => (
            <tr key={index}>
                <td><div className='box-product-mini'>
                  <div className='left'>
                    <img  src={`http://localhost:4000/chitietsanpham/${product.hinh_anh_1}`} alt=''/>
                  </div>
                  <div className='right'>
                    <div className='top'>{product.ten_sanpham}</div>
                    <div className='center'>màu: {product.ten_mau}</div>
                    <div className='bottom'>size: {product.ten_size}</div>
                  </div>
                  </div></td>
                <td>PM24{product.id_donhangchitiet}</td>
                <td>{formatCurrency(product.gia_ban / product.so_luong)}</td>
                <td>{product.so_luong}</td>
                 <td>{formatCurrency(product.gia_ban)}</td>
                
            </tr>
        ))}
    </tbody>
</table>

                <div className="tongthongtin">
                  <div className="chuathue">Chưa thuế <span>0đ</span></div>
                  <div className="phivanchuyen">Phí vận chuyển <span>0đ</span></div>
                  <div className="tong">Tổng<span><p>{formatCurrency(donHang && donHang.total)}</p></span></div>
                </div>
                <div className="quaylai"> <Link to='/user'>Quay lại trang thông tin tài khoản</Link></div>
              </div>
            </div>
        </div>
    );
};

export default ChiTietDonHang;