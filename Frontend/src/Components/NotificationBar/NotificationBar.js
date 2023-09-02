import React, { useEffect, useState } from 'react';
import './NotificationBar.css';

const NotificationBar = (props) => {
  const [showAlert, setShowAlert] = useState(false);
  const [showAlertAddDelete, setShowAlertAddDelete] = useState(false);
  const flag = props.flag;
  const notifyFlag = props.notifyFlag;
  useEffect(() => {
    if (flag !== 0 && flag !== 4) {
      setShowAlert(true);
      const timeoutId = setTimeout(() => {
        setShowAlert(false);
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
    else if (flag === 4) {
      setShowAlert(false)
      setShowAlertAddDelete(true);
      const timeoutId = setTimeout(() => {
        setShowAlertAddDelete(false);
        setShowAlert(false)
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [flag, notifyFlag]);

  if (flag === 1) {
    return (
      <>
        {showAlert && (
          <div className="alert alert-info"  role="alert">
            تم إضافة فايل جديد الآن
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
                تم حذف فايل الآن
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
        {showAlertAddDelete && (
            <div className="alert alert-warning" role="alert">
                تم إضافة فايل وتم تعديله الآن 
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