import javax.net.ssl.HttpsURLConnection;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.ServerSocket;
import java.net.URL;

public class Server {
    public static final String SERVER = "Proxy BSV";

    public static final String BASE_URL = "https://todo.doczilla.pro";
    public static final int PORT = 3000;
    private static int port = PORT;


    public static void main(String[] args) {
        if (parseArgs(args)) {
            try (ServerSocket serverSocket = new ServerSocket(port)) {
                System.out.println("Server is running...");
                while (true) {
                    new Client(serverSocket.accept());
                    System.out.println("\nNew connection accepted.");
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            System.out.println("The server is offline.");
        }
    }

    public static String[] getResponse(String method, String url) {
        return sendRequest(method, url);
    }

    private static String[] sendRequest(String method, String url) {
        try {
            HttpsURLConnection connection = (HttpsURLConnection) new URL(BASE_URL + url).openConnection();
            connection.setRequestMethod(method);
            System.out.println(connection.getResponseCode() + " " + connection.getResponseMessage());
            BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            String line;
            StringBuilder stringBuilder = new StringBuilder();
            while ((line = reader.readLine()) != null) {
                stringBuilder.append(line);
            }
            stringBuilder.append('\n');
            return new String[]{connection.getResponseCode() + " " + connection.getResponseMessage(), stringBuilder.toString()};
        } catch (Exception e) {
            e.printStackTrace();
            return new String[]{"500 Internal Server Error", ""};
        }
    }

    private static boolean parseArgs(String[] args) {
        for (int i = 0; i < args.length; i++) {
            switch (args[i]) {
                case "-h":
                    printHelp();
                    return false;
                case "-P":
                    port = Integer.parseInt(args[++i]);
                    break;
                default:
                    return false;
            }
        }
        return true;
    }

    private static void printHelp() {
        System.out.println("Available parameters are:" +
                "\n[-h] - print help;" +
                "\n[-P <port number>] - the port the server will listen on(DEFAULT - 3000);");
    }
}
