import socket
import threading
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

server = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
server.bind((TCP_IP,TCP_PORT))

def handle_client(addr,conn):
    print(f'[new connection] {addr} connected')
    connected = True
    while connected:
        msg_length = conn.recv(BUFFER_SIZE).decode(FORMAT)
        if msg_length:
            msg_length = int(msg_length)
            msg = conn.recv(msg_length).decode(FORMAT)
            if msg == DISCONNECT_MESSAGE:
                connected = False
            elif msg == SEND_IMAGE_MESSAGE:
                print(f'{addr}: {msg}')
                sendMessageToClient(RECEIVED_MESSAGE,conn)
                receiveImage(conn)
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

def receiveImage(conn):
    f = open('fingerPrint/test.png','wb')
    l= conn.recv(BUFFER_SIZE)
    while (l):
        print('receiving ...')
        f.write(l)
        l = conn.recv(BUFFER_SIZE)
    f.close()
    print('done receiving')
    sendMessageToClient(SUCCESS_MESSAGE,conn)


def start():
    print(f'server is running at  {TCP_IP}')
    server.listen()
    while True:
        conn,addr = server.accept()
        thread = threading.Thread(target=handle_client,args=(addr,conn))
        thread.start()
        print(f'active connections {threading.activeCount() - 1}')

start()



# print('hello')