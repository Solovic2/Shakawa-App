import React, { useEffect, useState } from 'react';
import './NotificationBar.css';

const NotificationBar = (props) => {
  const [showAlert, setShowAlert] = useState(false);
  const flag = props.flag;
  const notifyFlag = props.notifyFlag;
  useEffect(() => {
    if (flag !== 0 ) {
      setShowAlert(true);
      const timeoutId = setTimeout(() => {
        setShowAlert(false);
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [flag, notifyFlag]);

  if (flag === 1) {
    return (
      <>
        {showAlert && (
          <div className="alert alert-primary"  role="alert">
            تم إضافة شكوى جديدة الآن
          </div>
        )}
      </>
    );
  }

  else if (flag === 2) {
   
    return (
      <>
        {showAlert && (
            <div className="alert alert-danger" role="alert">
                تم حذف شكوى الآن من الجهاز الخادم
            </div>
        )}
      </>
    );
  }
  else if(flag === 3) {
    return (
      <>
        {showAlert && (
            <div className="alert alert-success" role="alert">
                تم تغيير حالة الشكوى او يوجد رد جديد 
            </div>
        )}
      </>
    );
  }
  else if(flag === 4) {
    return (
      <>
        {showAlert && (
            <div className="alert alert-danger" role="alert">
                تم حذف شكوى الآن من هذا القسم وتغييرها لقسم آخر
            </div>
        )}
      </>
    );
  }
  else if(flag === 5) {
    return (
      <>
        {showAlert && (
            <div className="alert alert-danger" role="alert">
                تم إخفاء شكوى الآن
            </div>
        )}
      </>
    );
  }
  // else if (flag === 3) {
  //   return (
  //     <>
  //       {showAlert && (
  //           <div className="alert alert-danger" role="alert">
  //               تم حذف فايل الآن
  //           </div>
  //       )}
  //        {showAlertAddDelete  && (
  //           <div className="alert alert-info" role="alert">
  //               تم إضافة فايل جديد الآن
  //           </div>
  //       )}
  //     </>
  //   );
  // }

  return <></>;
};

export default NotificationBar;