import React, { useEffect, useState } from 'react';
import './NotificationBar.css';

const NotificationBar = (props) => {
  const [showAlert, setShowAlert] = useState(false);
  const [showAlertAddDelete, setShowAlertAddDelete] = useState(false);
  const flag = props.flag;
  const notifyFlag = props.notifyFlag;
  useEffect(() => {
    if (flag !== 0 && flag !== 3) {
      setShowAlert(true);
      const timeoutId = setTimeout(() => {
        setShowAlert(false);
      }, 2000);
      return () => clearTimeout(timeoutId);
    }else if (flag === 3) {
        setShowAlert(true);
        let timeoutId1 = setTimeout(() => {
            setShowAlert(false);
            setShowAlertAddDelete(true)
            let timeoutId2 = setTimeout(() => {
              setShowAlertAddDelete(false);
            }, 1000);
            return () => clearTimeout(timeoutId2);
          }, 1000);
          return () => clearTimeout(timeoutId1);
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
  }else if (flag === 3) {
    return (
      <>
        {showAlert && (
            <div className="alert alert-danger" role="alert">
                تم حذف فايل الآن
            </div>
        )}
         {showAlertAddDelete  && (
            <div className="alert alert-info" role="alert">
                تم إضافة فايل جديد الآن
            </div>
        )}
      </>
    );
  }

  return <></>;
};

export default NotificationBar;