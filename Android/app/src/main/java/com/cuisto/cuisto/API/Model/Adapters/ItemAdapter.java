package com.cuisto.cuisto.API.Model.Adapters;

import android.content.Context;
import android.graphics.Color;
import android.support.annotation.NonNull;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.cuisto.cuisto.API.Model.Item;
import com.cuisto.cuisto.R;
import com.cuisto.cuisto.UI.ItemListFragment;


public class ItemAdapter extends RecyclerView.Adapter<ItemAdapter.ViewHolder>{
    private Context context;
    private ItemListFragment fragment;
    private Item[] data;
    private int SelectedIndex = -1;

    public ItemAdapter(Item[] data, Context context, ItemListFragment fragment) {

        this.data = data;
        this.context = context;
        this.fragment = fragment;
    }

    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        LayoutInflater layoutInflater = LayoutInflater.from(parent.getContext());
        final View listItem= layoutInflater.inflate(R.layout.list_item,parent,false);
        final ViewHolder viewHolder = new ViewHolder(listItem);
        return viewHolder;
    }

    @Override
    public void onBindViewHolder(final ViewHolder holder, final int position) {
        holder.nom.setText(data[position].getNom());
        holder.description.setText(data[position].getDescription());
        holder.prix.setText(data[position].getPrix());

        holder.rl_Item.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(holder.getAdapterPosition() != -1){
                    SelectedIndex = position;
                    fragment.loadDescription(data[holder.getAdapterPosition()].getId());
                    notifyDataSetChanged();
                }
            }
        });
        if (SelectedIndex == position) {
            holder.rl_Item.setBackgroundColor(Color.parseColor("#E3E3E3"));
        }
        else {
            holder.rl_Item.setBackgroundColor(Color.WHITE);
        }
    }

    @Override
    public int getItemCount() {
        return data.length;
    }

    public static class ViewHolder extends RecyclerView.ViewHolder{
        public TextView nom;
        public TextView description;
        public TextView prix;
        public RelativeLayout rl_Item;
        public ViewHolder(View itemView) {
            super(itemView);
            this.nom = (TextView) itemView.findViewById(R.id.tv_nom);
            this.description = (TextView) itemView.findViewById(R.id.tv_description);
            this.prix = (TextView) itemView.findViewById(R.id.tv_prix);
            this.rl_Item = itemView.findViewById(R.id.rl_Item);
        }
    }
}
