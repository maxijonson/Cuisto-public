package com.cuisto.cuisto.API.Model.Adapters;

import android.content.Context;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.cuisto.cuisto.API.Model.Item;
import com.cuisto.cuisto.API.Model.Items;
import com.cuisto.cuisto.R;
import com.cuisto.cuisto.UI.ItemListFragment;
import com.cuisto.cuisto.UI.PriseCommande;

public class ItemCommandeAdapter extends RecyclerView.Adapter<ItemCommandeAdapter.ViewHolder>{
    private Context mContext;
    private ItemListFragment fragment;
    private Items data;
    private int typeAdapter;
    private int i = 0;

    public ItemCommandeAdapter(Items data, Context context, int typeAdapter) {

        this.data = data;
        this.mContext = context;
        this.typeAdapter = typeAdapter;
    }

    @Override
    public ItemCommandeAdapter.ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {

        View view = LayoutInflater.from(mContext).inflate(R.layout.list_item,parent,false);
        final ItemCommandeAdapter.ViewHolder viewHolder = new ItemCommandeAdapter.ViewHolder(view);

        return viewHolder;
    }

    @Override
    public void onBindViewHolder(ItemCommandeAdapter.ViewHolder holder, final int position) {
        holder.bind(data.items.get(position));

        if(typeAdapter == 0){
            holder.rv_item.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if(i == 0){
                        i++;
                        ((PriseCommande)mContext).premierItem(data.items.get(position));
                    }
                    else {
                        ((PriseCommande)mContext).addItem(data.items.get(position));
                    }
                }
            });
        }
        else {
            holder.rv_item.setOnLongClickListener(new View.OnLongClickListener() {
                @Override
                public boolean onLongClick(View v) {
                    ((PriseCommande)mContext).removeItem(data.items.get(position));
                    Toast.makeText(mContext, "Long", Toast.LENGTH_SHORT).show();
                    return false;
                }
            });
        }
    }

    @Override
    public int getItemCount() {
        return data.items.size();
    }

    public static class ViewHolder extends RecyclerView.ViewHolder{
        public TextView nom;
        public TextView description;
        public TextView prix;
        RelativeLayout rv_item;

        public ViewHolder(View itemView) {
            super(itemView);
            this.nom = (TextView) itemView.findViewById(R.id.tv_nom);
            this.description = (TextView) itemView.findViewById(R.id.tv_description);
            this.prix = (TextView) itemView.findViewById(R.id.tv_prix);
            this.rv_item = itemView.findViewById(R.id.rl_Item);
        }
        public void bind(Item item){
            this.nom.setText(item.getNom());
            this.description.setText(item.getDescription());
            this.prix.setText(item.getPrix());

        }
    }
}