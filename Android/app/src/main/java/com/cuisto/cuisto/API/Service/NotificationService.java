package com.cuisto.cuisto.API.Service;

import android.annotation.SuppressLint;
import android.app.IntentService;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.PowerManager;
import android.os.SystemClock;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.NotificationManagerCompat;
import android.support.v7.widget.LinearLayoutManager;
import android.util.Log;
import android.widget.Toast;

import com.cuisto.cuisto.API.Model.Adapters.CommandesEnCoursAdapter;
import com.cuisto.cuisto.API.Model.Commande;
import com.cuisto.cuisto.API.Model.Commandes;
import com.cuisto.cuisto.API.Model.Employe;
import com.cuisto.cuisto.Authentification;
import com.cuisto.cuisto.R;
import com.cuisto.cuisto.UI.CommandeEnCoursFragment;
import com.cuisto.cuisto.UI.MainActivity;

import java.io.IOException;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class NotificationService extends Service {
    PowerManager pm;
    PowerManager.WakeLock wl;

    Integer DELAY /*In seconds*/ = 5;

    List<Commande> EnCours_Old = null;
    List<Commande> Pretes_Old = null;

    Integer notificationId = 1;

    Handler handler = new Handler();
    private Runnable periodicUpdate = new Runnable() {
        @Override
        public void run() {
            handler.postDelayed(periodicUpdate, DELAY*1000 - SystemClock.elapsedRealtime()%1000);
            try {
                checkForChanges();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    };

    @Override
    public int onStartCommand(Intent intent, int flags, int startId){
        handler.post(periodicUpdate);
        return START_STICKY;
    }

    @SuppressLint("InvalidWakeLockTag")
    public void onCreate(MainActivity activity, Employe employe){
        pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "NotificationService");
        wl.acquire();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        wl.release();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void checkForChanges() throws IOException {
        if (EnCours_Old != null) {
            //1. En Cours (Nouvelles commandes --> Cuisinier)
            enCours();


            //2. Pretes (Commandes pretes --> Serveuse)
            pretes();
        }
        else{
            firstLoad();
        }
    }

    private void sendNotification(String title, String messageBody, String FragmentToOpen) {
        createNotificationChannel();
        Intent intent = new Intent(this, MainActivity.class);
        intent.putExtra("fragment", FragmentToOpen);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent, 0);


        NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(this, "CuistoID")
                .setSmallIcon(R.drawable.cuisto_icon)
                .setContentTitle(title)
                .setContentText(messageBody)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(messageBody))
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true);

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this);
        notificationManager.notify(notificationId, mBuilder.build());
        Toast.makeText(getApplicationContext(),messageBody, Toast.LENGTH_SHORT).show();
        notificationId++;

    }
    private void createNotificationChannel() {
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Cuisto";
            String description = "Gestionnaire de restauration";
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            NotificationChannel channel = new NotificationChannel("CuistoID", name, importance);
            channel.setDescription(description);
            // Register the channel with the system; you can't change the importance
            // or other notification behaviors after this
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    private void pretes() {
        CommandeClient client = ServiceGenerator.retrofit.create(CommandeClient.class);
        Call<Commandes> list = client.ListeCommandes(Authentification.getXauth(),"Prête");

        list.enqueue(new Callback<Commandes>(){
            @Override
            public void onResponse(Call<Commandes> call, Response<Commandes> response){
                if (response.isSuccessful())
                {
                    List<Commande> Pretes_New = response.body().commandes;
                    if (Pretes_Old.size() < Pretes_New.size()) {
                        for (int i = Pretes_Old.size(); i < Pretes_New.size(); i++) {
                            Log.d("Value: ", Pretes_New.get(i).getId().toString() + " est prete");
                            sendNotification("Commande prête!", "La commande no." + Pretes_New.get(i).getId().toString()+ " est prête.", "CommandeEnCoursFragment");
                        }
                    }
                    Pretes_Old = Pretes_New;
                }
                else {
                    switch (response.code()) {
                        case 404:
                            Log.e("404", "NotificationService.pretes()- 404: Not found");
                            break;
                        case 401:
                            Log.e("404", "NotificationService.pretes()- 401: Bad request");
                            break;
                        default:
                            Log.e("Error onResponse", "NotificationService.pretes(): " + String.valueOf(response.code()));
                            break;
                    }
                }
            }
            @Override
            public void onFailure(Call<Commandes> call, Throwable t) {
                t.fillInStackTrace();
                Log.d("ERREUR", "onFailure: "+t.getMessage());
            }
        });
    }

    private void enCours() {
        if(ServiceGenerator.retrofit != null){

            CommandeClient client = ServiceGenerator.retrofit.create(CommandeClient.class);
            Call<Commandes> list = client.ListeCommandes(Authentification.getXauth(),"En Cours");

            list.enqueue(new Callback<Commandes>(){
                @Override
                public void onResponse(Call<Commandes> call, Response<Commandes> response){
                    if (response.isSuccessful())
                    {
                        List<Commande> EnCours_New = response.body().commandes;
                        if (EnCours_Old.size() < EnCours_New.size()) {
                            for (int i = EnCours_Old.size(); i < EnCours_New.size(); i++) {
                                Log.d("Value: ", EnCours_New.get(i).getId().toString() + " a ete ajouter a la liste");
                                sendNotification("Nouvelle Commande!", "Une nouvelle commande à été crée. Voir les commandes en cours", "CommandePretesFragment");
                            }
                        }
                        EnCours_Old = EnCours_New;
                    }
                    else {
                        switch (response.code()) {
                            case 404:
                                Log.e("404", "NotificationService.enCours()- 404: Not found");
                                break;
                            case 401:
                                Log.e("404", "NotificationService.enCours()- 401: Bad request");
                                break;
                            default:
                                Log.e("Error onResponse", "NotificationService.enCours(): " + String.valueOf(response.code()));
                                break;
                        }
                    }
                }
                @Override
                public void onFailure(Call<Commandes> call, Throwable t) {
                    t.fillInStackTrace();
                    Log.d("ERREUR", "onFailure: "+t.getMessage());
                }
            });
        }

    }

    private void firstLoad() {
        if(ServiceGenerator.retrofit != null){

            CommandeClient client = ServiceGenerator.retrofit.create(CommandeClient.class);
            Call<Commandes> list = client.ListeCommandes(Authentification.getXauth(),"En Cours");

            list.enqueue(new Callback<Commandes>(){
                @Override
                public void onResponse(Call<Commandes> call, Response<Commandes> response){
                    if (response.isSuccessful())
                    {
                        EnCours_Old = response.body().commandes;
                    }
                    else {
                        switch (response.code()) {
                            case 404:
                                Log.e("404", "NotificationService.firstLoad()- 404: Not found");
                                break;
                            case 401:
                                Log.e("404", "NotificationService.firstLoad()- 401: Bad request");
                                break;
                            default:
                                Log.e("Error onResponse", "NotificationService.firstLoad(): " + String.valueOf(response.code()));
                                break;
                        }
                    }
                }
                @Override
                public void onFailure(Call<Commandes> call, Throwable t) {
                    t.fillInStackTrace();
                    Log.d("ERREUR", "onFailure: "+t.getMessage());
                }
            });

            CommandeClient client2 = ServiceGenerator.retrofit.create(CommandeClient.class);
            Call<Commandes> list2 = client2.ListeCommandes(Authentification.getXauth(),"Prête");

            list2.enqueue(new Callback<Commandes>(){
                @Override
                public void onResponse(Call<Commandes> call, Response<Commandes> response){
                    if (response.isSuccessful())
                    {
                        Pretes_Old = response.body().commandes;
                    }
                    else {
                        switch (response.code()) {
                            case 404:
                                Log.e("404", "NotificationService.firstLoad()- 404: Not found");
                                break;
                            case 401:
                                Log.e("404", "NotificationService.firstLoad()- 401: Bad request");
                                break;
                            default:
                                Log.e("Error onResponse", "NotificationService.firstLoad(): " + String.valueOf(response.code()));
                                break;
                        }
                    }
                }
                @Override
                public void onFailure(Call<Commandes> call, Throwable t) {
                    t.fillInStackTrace();
                    Log.d("ERREUR", "onFailure: "+t.getMessage());
                }
            });
        }
    }
}
