package com.cuisto.cuisto.API.Model.Adapters;

import android.content.Context;
import android.content.DialogInterface;
import android.support.annotation.NonNull;
import android.support.v7.app.AlertDialog;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.cuisto.cuisto.API.Model.Commande;
import com.cuisto.cuisto.R;
import com.cuisto.cuisto.UI.CommandePreteFragment;

public class CommandePreteAdapter extends RecyclerView.Adapter<CommandePreteAdapter.ViewHolder> {
    private Context context;
    private CommandePreteFragment fragment;
    private Commande[] data;

    public CommandePreteAdapter(Commande[] data, Context context, CommandePreteFragment fragment) {
        this.context = context;
        this.fragment = fragment;
        this.data = data;
    }

    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType)
    {
        LayoutInflater layoutInflater = LayoutInflater.from(parent.getContext());
        final View listCommandes = layoutInflater.inflate(R.layout.list_commandes,parent,false);
        final ViewHolder viewHolder = new ViewHolder(listCommandes);
        viewHolder.rl_ListeCommandes.setOnLongClickListener(new View.OnLongClickListener() {
            @Override
            public boolean onLongClick(View v) {
                new AlertDialog.Builder(context)
                        .setIcon(android.R.drawable.ic_dialog_alert)
                        .setTitle("Mise à jour de la commande.")
                        .setMessage("Voulez vous vraiment indiquer cette commande comme terminée?")
                        .setPositiveButton("Oui", new DialogInterface.OnClickListener()
                        {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                if(viewHolder.getAdapterPosition() != -1) {
                                    int Selection = data[viewHolder.getAdapterPosition()].getId();
                                    fragment.readyCommande(Selection);
                                }
                                else {
                                    Toast.makeText(context, "Veuillez attendre un peu avant de refaire cette action", Toast.LENGTH_SHORT).show();
                                }
                            }

                        })
                        .setNegativeButton("Non", null)
                        .show();
                return true;
            }
        });
        return viewHolder;
    }

    @Override
    public int getItemCount() {
        return data.length;
    }

    @Override
    public void onBindViewHolder(ViewHolder holder, int position)
    {
        holder.idCommande.setText(String.valueOf(data[position].getId()));
        holder.nomSalle.setText(data[position].getTable().getSalle().getNom());
        holder.idTable.setText(data[position].getTable().getNom());
        holder.idClient.setText(String.valueOf(data[position].getClient()));
        holder.nomPrenomEmploye.setText((data[position].getEmploye().getPrenom()) +" " + data[position].getEmploye().getNom());

        int size = data[position].getItems().size();
        String[] NomItems = new String[size];
        for(int i = 0; i < size; i++)
        {
            NomItems[i] = data[position].getItems().get(i).getNom();
        }
        ArrayAdapter listAdapter = new ArrayAdapter(context,android.R.layout.simple_list_item_1,NomItems);
        holder.items.setAdapter(listAdapter);

    }

    public static class ViewHolder extends RecyclerView.ViewHolder{
        public TextView idCommande;
        public TextView nomSalle;
        public TextView idTable;
        public TextView idClient;
        public TextView nomPrenomEmploye;
        public ListView items;
        public RelativeLayout rl_ListeCommandes;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            this.idCommande = itemView.findViewById(R.id.tv_Id);
            this.nomSalle = itemView.findViewById(R.id.tv_Salle);
            this.idTable = itemView.findViewById(R.id.tv_Table);
            this.idClient = itemView.findViewById(R.id.tv_Client);
            this.nomPrenomEmploye = itemView.findViewById(R.id.tv_Employe);
            this.items = itemView.findViewById(R.id.lv_items);
            this.rl_ListeCommandes = itemView.findViewById(R.id.rl_ListeCommandes);
        }
    }
}
