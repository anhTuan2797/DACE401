import socket
import datetime
import threading
import mysql.connector
from socketserver import ThreadingMixIn

TCP_IP = socket.gethostbyname(socket.gethostname())
TCP_PORT = 9001
BUFFER_SIZE = 1024
FORMAT = 'utf-8'
DISCONNECT_MESSAGE = 'DISCONNECT'
RECEIVED_MESSAGE = 'RECEIVED'
SEND_IMAGE_MESSAGE = 'SEND_IMAGE'
FAIL_MESSAGE = 'FAIL'
SUCCESS_MESSAGE = 'SUCCESS' 
ATTENDANCE_MACHINE_MSG = 'ATTENDANCE'
GET_CLASS = 'GET_CLASS'
CANT_FIND_DATA_MSG = 'CANT_FIND_DATA'
GET_CLASS_DETAIL_MSG = 'GET_CLASS_DETAIL'
STUDENT_ATTENDANCE_MSG = 'STUDENT_ATTENDANCE'
SEND_ATTENDANCE_IMAGE_MESSAGE = 'SEND_ATTENDANCE_IMAGE'

myDb = mysql.connector.connect(
        host = 'localhost',
        user = 'root',
        password = 'root',
        database = 'schooldb'
    )

UPDATE_STUDENT_QUERY = ('UPDATE student_tbl SET student_fpLink = %s WHERE student_id = %s')
GET_CLASS_ID_FROM_MACHINE_ID_QUERY = ('SELECT class_id,session_time,session_id FROM room_tbl inner join session_tbl on session_tbl.room_id = room_tbl.room_id where room_tbl.machine_id = %s and session_date = %s;')
GET_CLASS_DETAIL_FROM_CLASS_ID_QUERY = ('SELECT student_id from class_detail_tbl where class_id = %s;')
INSERT_ATTTENDANCE = ('insert into attendance_tbl value (%s,%s,%s,%s)')
GET_SESSION_ID_FROM_DATE = ('select session_id,session_time from session_tbl where session_date = %s and class_id = %s')

server = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
server.bind((TCP_IP,TCP_PORT))

#ham xu ly yeu cau cua client
def handle_client(addr,conn):
    machineId = ''
    nextClassId = ''
    print(f'[new connection] {addr} connected')
    connected = True
    while connected:
        msg_length = conn.recv(BUFFER_SIZE).decode(FORMAT)
        if msg_length:
            msg_length = int(msg_length)
            msg = conn.recv(msg_length).decode(FORMAT)
            print(msg)
            if msg == DISCONNECT_MESSAGE:
                connected = False
            elif msg == SEND_IMAGE_MESSAGE:              
                sendMessageToClient(RECEIVED_MESSAGE,conn)
                msg_length = conn.recv(BUFFER_SIZE).decode(FORMAT)
                if msg_length:
                    msg_length = int(msg_length)
                    msg = conn.recv(msg_length).decode(FORMAT)
                    sendMessageToClient(SUCCESS_MESSAGE,conn)
                    receiveImage(conn,msg)
                # receiveImage(conn)
            elif msg == SEND_ATTENDANCE_IMAGE_MESSAGE:
                sendMessageToClient(RECEIVED_MESSAGE,conn)
                msg_length = conn.recv(BUFFER_SIZE).decode(FORMAT)
                if msg_length:
                    msg_length = int(msg_length)
                    msg = conn.recv(msg_length).decode(FORMAT)
                    li = list(msg.split(' '))
                    classId = li[0]
                    sessionId = li[1]
                    studentId = li[2]
                    print(classId)
                    print(sessionId)
                    print(studentId)
                    sendMessageToClient(RECEIVED_MESSAGE,conn)
                    receiveAttendanceImage(conn,classId,sessionId,studentId)
                    sendMessageToClient(SUCCESS_MESSAGE,conn)
            elif msg == ATTENDANCE_MACHINE_MSG:
                sendMessageToClient(RECEIVED_MESSAGE,conn)
                msg_length = conn.recv(BUFFER_SIZE).decode(FORMAT)
                if msg_length:
                    msg_length = int(msg_length)
                    msg = conn.recv(msg_length).decode(FORMAT)
                    machineId = msg
                    sendMessageToClient(RECEIVED_MESSAGE,conn)
            elif msg == STUDENT_ATTENDANCE_MSG:
                sendMessageToClient(RECEIVED_MESSAGE,conn)
                msg_length = conn.recv(BUFFER_SIZE).decode(FORMAT)
                if msg_length:
                    msg_length = int(msg_length)
                    msg = conn.recv(msg_length).decode(FORMAT)
                    li = list(msg.split(' '))
                    classId = li[0]
                    sessionId = li[1]
                    print(classId)
                    print(sessionId)
                    sendMessageToClient(RECEIVED_MESSAGE,conn)
                    msg_length = conn.recv(BUFFER_SIZE).decode(FORMAT)
                    if msg_length:
                        msg_length = int(msg_length)
                        msg = conn.recv(msg_length).decode(FORMAT)
                        studentId = msg
                        print(studentId)
                        try:
                            now = datetime.datetime.now()
                            today = str(now.month) + '/' + str(now.day) + '/' +str(now.year)
                            currentTime = now.hour*3600+now.minute*60+now.second
                            myCursor = myDb.cursor()
                            myCursor.execute(INSERT_ATTTENDANCE,(sessionId,classId,studentId,currentTime))
                            myDb.commit()
                            sendMessageToClient(RECEIVED_MESSAGE,conn)
                        except mysql.connector.Error as err:
                            print(err)
                            sendMessageToClient(FAIL_MESSAGE,conn)
            elif msg == GET_CLASS_DETAIL_MSG:
                print('get class detail')
                sendMessageToClient(RECEIVED_MESSAGE,conn)
                fileName = nextClassId + '.txt'
                print(fileName)
                sendFileToClient(fileName,conn)
            elif msg == GET_CLASS:
                try:
                    now = datetime.datetime.now()
                    today = str(now.month) + '/' + str(now.day) + '/' + str(now.year)
                    print(today)
                    myCursor = myDb.cursor()
                    myCursor.execute(GET_CLASS_ID_FROM_MACHINE_ID_QUERY,(machineId,today)) 
                    result = myCursor.fetchall()
                    if result:
                        currentTime = now.hour*3600 + now.minute*60 + now.second
                        timeToSession = 86400
                        for x in result:
                            sessionTime = x[1]
                            if sessionTime - currentTime < timeToSession and sessionTime - currentTime > 0:
                                timeToSession = sessionTime - currentTime
                                nextSession = x
                        sendMessageToClient(SUCCESS_MESSAGE,conn)
                        nextClassId = nextSession[0]
                        msg = nextSession[0] + " "+str(nextSession[2])
                        print(msg)
                        sendMessageToClient(msg,conn)
                        #sendMessageToClient(SEND_CLASS_DETAIL_MSG,conn)
                        myCursor.execute(GET_CLASS_DETAIL_FROM_CLASS_ID_QUERY,(nextClassId,))
                        result = myCursor.fetchall()
                        if result:
                            fileName = nextClassId + '.txt'
                            f = open(fileName,'w')
                            for x in result:
                                f.write(x[0])
                                f.write(' ')
                            f.close()
                            # respone =  sendFileToClient(fileName,conn)
                            # if respone == SUCCESS_MESSAGE:
                            #     connected = False
                    else:
                        sendMessageToClient(CANT_FIND_DATA_MSG,conn)
                except mysql.connector.Error as err:
                     print('database error: {}'.format(err))
                     sendMessageToClient(err,conn)
                pass
            else :
               sendMessageToClient(FAIL_MESSAGE,conn)
    conn.close()
      
def sendMessageToClient(msg,conn):
    #msg: message
    #conn: client connection 
    message = msg.encode(FORMAT)
    msg_length = len(message)
    send_length = str(msg_length).encode(FORMAT)
    send_length += b' '*(BUFFER_SIZE-len(send_length)) 
    conn.send(send_length)
    conn.send(message)

def sendFileToClient(fileName,conn):
    f = open(fileName,'rb')
    l = f.read(BUFFER_SIZE)
    while (l):
        print('sending ...')
        conn.send(l)
        l = f.read(BUFFER_SIZE)
    print('send done')
    # cut connection
    conn.shutdown(socket.SHUT_WR)
    #conn.close()

def receiveImage(conn,msg):
    #nhan anh van tay tu client va luu vao server/fingerPrint
    fpLink = 'fingerPrint/'+msg
    f = open(fpLink,'wb')
    l= conn.recv(BUFFER_SIZE)
    while (l):
        print('receiving ...')
        f.write(l)
        l = conn.recv(BUFFER_SIZE)
    f.close()
    print('done receiving')
    studentId = msg.removesuffix('.png')
    try:
        myCursor = myDb.cursor()
        myCursor.execute(UPDATE_STUDENT_QUERY,(fpLink,studentId))
        myDb.commit()
        print(myCursor.rowcount,'row affected')
        sendMessageToClient(SUCCESS_MESSAGE,conn)
        myCursor.close()
    except mysql.connector.Error as err:
        print('database error: {}'.format(err))

def receiveAttendanceImage(conn,classId,sessionId,studentId):
    #nhan anh client gui khi diem danh
    link ='attendanceImage/' + classId+'/'+sessionId+'/'+studentId+'.jpg'
    f = open(link,'wb')
    l= conn.recv(BUFFER_SIZE)
    while (l):
        print('receiving ...')
        f.write(l)
        l = conn.recv(BUFFER_SIZE)
    f.close()
    print('done receiving')

def start():
    print(f'server is running at  {TCP_IP}')
    if myDb.is_connected():
        print('database connected')
    server.listen()
    while True:
        conn,addr = server.accept()
        thread = threading.Thread(target=handle_client,args=(addr,conn))
        thread.start()
        print(f'active connections {threading.activeCount() - 1}')

def test():
    msg = '16521376.png'
    studentId = msg.removesuffix('.png')
    print(studentId)
    try:
        myCursor = myDb.cursor()
        myCursor.execute(UPDATE_STUDENT_QUERY,(msg,studentId))
        myDb.commit()
        print(myCursor.rowcount,'row affected')
        myCursor.close()
    except mysql.connector.Error as err:
        print('database error: {}'.format(err))
start()
#test()



