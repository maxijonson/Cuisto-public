package com.cuisto.cuisto.API.Model;

import java.util.List;

public class Clients {
    public List<Client> clientList;

    public Clients(List<Client> clientList) {
        this.clientList = clientList;
    }

    public List<Client> getClientList() {

        return clientList;
    }
}
