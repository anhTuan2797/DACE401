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
SEND_CLASS_DETAIL_MSG = 'SEND_CLASS_DETAIL'

myDb = mysql.connector.connect(
        host = 'localhost',
        user = 'root',
        password = 'root',
        database = 'schooldb'
    )

UPDATE_STUDENT_QUERY = ('UPDATE student_tbl SET student_fpLink = %s WHERE student_id = %s')
GET_CLASS_ID_FROM_MACHINE_ID_QUERY = ('SELECT class_id,session_time FROM room_tbl inner join session_tbl on session_tbl.room_id = room_tbl.room_id where room_tbl.machine_id = %s and session_date = %s;')
server = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
server.bind((TCP_IP,TCP_PORT))

def handle_client(addr,conn):
    machineId = ''
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
            elif msg == ATTENDANCE_MACHINE_MSG:
                sendMessageToClient(RECEIVED_MESSAGE,conn)
                msg_length = conn.recv(BUFFER_SIZE).decode(FORMAT)
                if msg_length:
                    msg_length = int(msg_length)
                    msg = conn.recv(msg_length).decode(FORMAT)
                    machineId = msg
                    sendMessageToClient(RECEIVED_MESSAGE,conn)
            elif msg == GET_CLASS:
                try:
                    now = datetime.datetime.now()
                    today = str(now.month) + '/' + str(now.day) + '/' + str(now.year)
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
                        sendMessageToClient(nextClassId,conn)
                        sendMessageToClient(SEND_CLASS_DETAIL_MSG,conn)
                        
                    else:
                        sendMessageToClient(CANT_FIND_DATA_MSG,conn)
                except mysql.connector.errors as err:
                     print('database error: {}'.format(err))
                     sendMessageToClient(err,conn)
                pass
            else :
               sendMessageToClient(FAIL_MESSAGE,conn)
    conn.close()
    
def sendMessageToClient(msg,conn):
    message = msg.encode(FORMAT)
    msg_length = len(message)
    send_length = str(msg_length).encode(FORMAT)
    send_length += b' '*(BUFFER_SIZE-len(send_length)) 
    conn.send(send_length)
    conn.send(message)

def receiveImage(conn,msg):
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



