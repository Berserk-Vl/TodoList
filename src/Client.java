import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedList;

public class Client {
    private final Socket socket;
    private BufferedReader reader;
    private PrintWriter writer;

    public Client(Socket socket) {
        this.socket = socket;
        try {
            reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            writer = new PrintWriter(socket.getOutputStream(), true);
            listener();
        } catch (Exception e) {
            e.printStackTrace();
            closeSocket();
        }
    }

    private void listener() {
        Thread thread = new Thread(() -> {
            try {
                String line;
                LinkedList<String> header = new LinkedList<>();
                StringBuilder content = new StringBuilder();
                String requestLine = null;
                int contentLength = 0;
                while ((line = reader.readLine()) != null) {
                    if (requestLine == null) {
                        System.out.println("\n-> REQUEST RECEIVED:");
                        requestLine = line;
                    }
                    System.out.println(line);
                    if (line.length() == 0) {
                        for (int i = 0; i < contentLength; i++) {
                            char ch = (char) reader.read();
                            content.append(ch);
                            //System.out.print(ch);
                        }
                        processRequest(requestLine, header);
                        requestLine = null;
                        header = new LinkedList<>();
                        content = new StringBuilder();
                    } else {
                        header.add(line);
                        if (line.startsWith("Content-Length")) {
                            contentLength = Integer.parseInt(line.split(" ")[1]);
                        }
                    }
                }
                closeSocket();
            } catch (Exception e) {
                e.printStackTrace();
                closeSocket();
            }
        });
        thread.setDaemon(true);
        thread.start();
    }

    private void processRequest(String requestLine, LinkedList<String> headers) {
        String[] requestLineData = requestLine.split(" ");
        String[] response;
        LinkedList<String> additionalHeaders = new LinkedList<>();
        response = Server.getResponse(requestLineData[0], requestLineData[1]);
        for (String header : headers) {
            if (header.startsWith("Origin") && header.split(" ")[1].equals("null")) {
                additionalHeaders.add("Access-Control-Allow-Origin: *");
                break;
            }
        }
        sendResponse(response, requestLineData[2], additionalHeaders);
    }

    private void sendResponse(String[] response, String connectionType, LinkedList<String> additionalHeaders) {
        StringBuilder header = new StringBuilder(getBaseHeader());
        for (String additionalHeader : additionalHeaders) {
            header.append('\n').append(additionalHeader);
        }
        if (response[1].length() > 0) {
            header.append('\n').append("Content-Type: application/json");
        }
        header.append('\n').append("Content-Length: ").append(response[1].getBytes().length);

        StringBuilder message = new StringBuilder();
        message.append(connectionType).append(' ').append(response[0]).append('\n');
        message.append(header).append("\n\n");
        String fullHeader = message.toString();
        if (response[1].length() > 0) {
            message.append(response[1]);
        }
        message.append('\n');
        writer.print(message);
        writer.flush();
        System.out.println("\n-> RESPONSE SENT:");
        System.out.println(fullHeader);
        //System.out.println(message);
    }

    private String getBaseHeader() {
        return "Date: " + ZonedDateTime.now().format(DateTimeFormatter.RFC_1123_DATE_TIME) +
                "\nServer: " + Server.SERVER +
                "\nConnection: Keep-Alive" +
                "\nKeep-Alive: timeout=2, max=100";
    }

    private void closeSocket() {
        try {
            socket.close();
            System.out.println("Client(" + socket.getRemoteSocketAddress() + ") socket was closed.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
